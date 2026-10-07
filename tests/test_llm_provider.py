"""Tests for LLM Providers (MockProvider, LocalProvider abstraction, configuration)."""

import unittest
from backend.llm.provider import LLMProvider, GenerationResult
from backend.llm.mock_provider import MockProvider
from backend.llm.local_provider import LocalProvider
from backend.llm.config import LLMConfig, get_config


class TestLLMProvider(unittest.TestCase):
    def setUp(self):
        self.mock_provider = MockProvider()

    def test_mock_provider_implements_interface(self):
        self.assertIsInstance(self.mock_provider, LLMProvider)

    def test_mock_provider_health(self):
        health = self.mock_provider.health()
        self.assertEqual(health["status"], "ok")
        self.assertEqual(health["provider"], "mock")
        self.assertIn("model", health)

    def test_mock_provider_model_info(self):
        info = self.mock_provider.model_info()
        self.assertEqual(info["provider"], "mock")
        self.assertTrue(info["local_sovereign"])
        self.assertIn("context_length", info)

    def test_mock_provider_generate_french(self):
        res = self.mock_provider.generate(
            prompt="Analyse vibratoire sur palier broche",
            language="fr"
        )
        self.assertIsInstance(res, GenerationResult)
        self.assertIn("OBSERVATIONS:", res.text)
        self.assertIn("INFERENCE:", res.text)
        self.assertIn("DOCUMENTATION:", res.text)
        self.assertIn("RECOMMANDATION", res.text)
        self.assertGreater(res.prompt_tokens, 0)
        self.assertGreater(res.completion_tokens, 0)
        self.assertGreater(res.latency_ms, 0)
        self.assertTrue(res.requires_human_validation)
        self.assertGreater(len(res.proposed_actions), 0)

    def test_mock_provider_generate_english(self):
        res = self.mock_provider.generate(
            prompt="Bearing temperature and vibration analysis on CNC spindle",
            language="en"
        )
        self.assertIsInstance(res, GenerationResult)
        self.assertIn("OBSERVATIONS:", res.text)
        self.assertIn("RECOMMENDATION", res.text)
        self.assertTrue(res.requires_human_validation)

    def test_mock_provider_streaming(self):
        chunks = list(self.mock_provider.generate_stream("Test de vibration", language="fr"))
        self.assertGreater(len(chunks), 1)
        self.assertTrue(chunks[-1].is_final)
        self.assertEqual(chunks[-1].finish_reason, "stop")

    def test_insufficient_documentation_guardrail(self):
        res = self.mock_provider.generate(
            prompt="Donne moi une recette cuisine de gateau au chocolat",
            language="fr"
        )
        self.assertIn("Informations insuffisantes dans la documentation disponible", res.text)
        self.assertEqual(len(res.sources_used), 0)
        self.assertFalse(res.requires_human_validation)

    def test_local_provider_graceful_offline_handling(self):
        # Point to unreachable local endpoint
        local = LocalProvider(base_url="http://127.0.0.1:59999/v1", timeout=1.0)
        res = local.generate("Test prompt offline")
        self.assertEqual(res.finish_reason, "error")
        self.assertIn("Impossible de joindre le serveur local", res.text)


if __name__ == "__main__":
    unittest.main()
