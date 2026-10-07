"""INDUXIA V1.4 - LLM Subsystem
Provides local LLM execution, device discovery (AMD ROCm / CPU),
and verifiable hardware benchmarking.
"""

from backend.llm.config import LLMConfig, get_config
from backend.llm.provider import LLMProvider, GenerationResult, StreamChunk
from backend.llm.mock_provider import MockProvider
from backend.llm.local_provider import LocalProvider
from backend.llm.device import detect_device, DeviceInfo
from backend.llm.benchmark import LLMBenchmark, BenchmarkResult
from backend.llm.diagnostics import run_diagnostics, DiagnosticsResult

__all__ = [
    "LLMConfig",
    "get_config",
    "LLMProvider",
    "GenerationResult",
    "StreamChunk",
    "MockProvider",
    "LocalProvider",
    "detect_device",
    "DeviceInfo",
    "LLMBenchmark",
    "BenchmarkResult",
    "run_diagnostics",
    "DiagnosticsResult",
]
