"""Tests for reproducible LLM benchmarking engine."""

import unittest
from backend.llm.benchmark import LLMBenchmark, BenchmarkResult
from backend.llm.mock_provider import MockProvider
from backend.llm.device import detect_device


class TestBenchmark(unittest.TestCase):
    def setUp(self):
        self.benchmarker = LLMBenchmark(provider=MockProvider())

    def test_benchmark_runs_and_statistics(self):
        runs = 4
        warmup = 1
        res = self.benchmarker.run(
            prompt="Test prompt vibration",
            runs=runs,
            warmup=warmup,
            max_tokens=64,
        )

        self.assertIsInstance(res, BenchmarkResult)
        self.assertEqual(res.runs, runs)
        self.assertEqual(res.warmup, warmup)
        self.assertEqual(len(res.raw_latencies_ms), runs)

        # Statistical sanity checks
        self.assertIn("median", res.latency_ms)
        self.assertIn("p95", res.latency_ms)
        self.assertIn("mean", res.latency_ms)
        self.assertIn("min", res.latency_ms)
        self.assertIn("max", res.latency_ms)
        self.assertGreaterEqual(res.latency_ms["max"], res.latency_ms["min"])

        # Throughput checks
        self.assertGreater(res.generation["tokens_per_second"], 0.0)
        self.assertGreater(res.generation["total_tokens"], 0)

    def test_non_amd_disclaimer_accuracy(self):
        device = detect_device()
        res = self.benchmarker.run(runs=1, warmup=0)
        if device.device != "amd" or not device.available:
            self.assertFalse(res.is_amd_benchmark)
            self.assertIsNotNone(res.disclaimer)
            self.assertIn("AMD ROCm GPU not detected", res.disclaimer)

    def test_optional_real_amd_benchmark(self):
        device = detect_device()
        if device.device != "amd" or not device.available:
            self.skipTest("No real AMD ROCm hardware available for GPU benchmark. Test skipped.")
        res = self.benchmarker.run(runs=3, warmup=1)
        self.assertTrue(res.is_amd_benchmark)


if __name__ == "__main__":
    unittest.main()
