"""Tests for API routes and payload validation."""

import unittest
from backend.api.llm import (
    get_version_info,
    get_llm_status,
    get_llm_models,
    handle_generate,
    get_diagnostics,
)
from backend.api.benchmark import (
    run_benchmark_endpoint,
    get_benchmark_results_endpoint,
)


class TestLLMAPI(unittest.TestCase):
    def test_version_endpoint(self):
        ver = get_version_info()
        self.assertEqual(ver["name"], "INDUXIA")
        self.assertEqual(ver["version"], "1.4.0")
        self.assertEqual(ver["codename"], "AMD ROCm Local AI Engine")

    def test_llm_status_endpoint(self):
        status = get_llm_status()
        self.assertIn("provider", status)
        self.assertIn("model", status)
        self.assertIn("device", status)
        self.assertIn("health", status)

    def test_llm_models_endpoint(self):
        models_data = get_llm_models()
        self.assertIn("models", models_data)
        self.assertGreater(len(models_data["models"]), 0)

    def test_generate_endpoint_success(self):
        res = handle_generate({"prompt": "Diagnostic vibration broche CNC", "language": "fr"})
        self.assertIn("text", res)
        self.assertIn("OBSERVATIONS:", res["text"])
        self.assertGreater(res["prompt_tokens"], 0)

    def test_generate_endpoint_empty_prompt_rejected(self):
        res = handle_generate({"prompt": "   "})
        self.assertEqual(res["status"], "failed")
        self.assertIn("error", res)

    def test_generate_endpoint_length_limit_security(self):
        oversized = "A" * 9000
        res = handle_generate({"prompt": oversized})
        self.assertEqual(res["status"], "rejected")
        self.assertIn("exceeds maximum", res["error"])

    def test_diagnostics_endpoint(self):
        diag = get_diagnostics()
        self.assertIn("os_name", diag)
        self.assertIn("python_version", diag)
        self.assertIn("rocm_status", diag)
        self.assertIn("rag_status", diag)
        self.assertIn("copilot_status", diag)

    def test_benchmark_api_endpoint(self):
        res = run_benchmark_endpoint({"runs": 2, "warmup": 1})
        self.assertIn("latency_ms", res)
        self.assertIn("generation", res)
        history = get_benchmark_results_endpoint()
        self.assertGreaterEqual(history["count"], 1)


if __name__ == "__main__":
    unittest.main()
