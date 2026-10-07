"""Tests for Industrial Copilot V1.4, RAG alignment, and Human-in-the-Loop."""

import unittest
from backend.llm.mock_provider import MockProvider


class TestCopilotV14(unittest.TestCase):
    def setUp(self):
        self.copilot = MockProvider()

    def test_copilot_pipeline_structured_format(self):
        res = self.copilot.generate(
            prompt="La broche CNC présente des vibrations anormales et une hausse de température.",
            language="fr"
        )
        self.assertIn("OBSERVATIONS:", res.text)
        self.assertIn("INFERENCE:", res.text)
        self.assertIn("DOCUMENTATION:", res.text)
        self.assertIn("RECOMMANDATION", res.text)
        self.assertGreater(len(res.sources_used), 0)
        self.assertIn("ISO 10816-3", res.sources_used[0])

    def test_bilingual_french(self):
        res = self.copilot.generate(
            prompt="Quelle est la procédure de maintenance du palier ?",
            language="fr"
        )
        self.assertIn("RECOMMANDATION (Soumise à validation humaine)", res.text)
        self.assertIn("Validation requise par le superviseur", res.text)

    def test_bilingual_english(self):
        res = self.copilot.generate(
            prompt="What is the bearing maintenance procedure for spindle?",
            language="en"
        )
        self.assertIn("RECOMMENDATION (Subject to Human Validation)", res.text)
        self.assertIn("Mandatory supervisor approval required", res.text)

    def test_anti_hallucination_out_of_scope(self):
        res = self.copilot.generate(
            prompt="Raconte moi une histoire de science-fiction sur les extraterrestres ou donne une recette cuisine",
            language="fr"
        )
        self.assertIn("Informations insuffisantes dans la documentation disponible", res.text)
        self.assertEqual(len(res.sources_used), 0)
        self.assertFalse(res.requires_human_validation)

    def test_human_in_the_loop_safety_contract(self):
        res = self.copilot.generate(
            prompt="Arrêter immédiatement la machine et modifier la consigne de vitesse",
            language="fr"
        )
        # LLM must propose action, not execute it directly
        self.assertTrue(res.requires_human_validation)
        self.assertGreater(len(res.proposed_actions), 0)
        for action in res.proposed_actions:
            self.assertTrue(action.get("requires_approval", True))
            self.assertIn("proposed_value", action)
            self.assertIn("target", action)


if __name__ == "__main__":
    unittest.main()
