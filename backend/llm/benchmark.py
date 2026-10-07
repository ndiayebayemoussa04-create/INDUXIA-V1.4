"""INDUXIA V1.4 - Local & AMD ROCm Benchmark Engine
Measures authentic hardware execution metrics. Never fabricates benchmark numbers.
Provides rigorous statistical analysis (warmup, median, p95, tok/s, peak VRAM).
"""

import time
import math
import datetime
from dataclasses import dataclass, asdict, field
from typing import Dict, Any, List, Optional
from backend.llm.device import detect_device, DeviceInfo
from backend.llm.config import get_config
from backend.llm.mock_provider import MockProvider
from backend.llm.local_provider import LocalProvider
from backend.llm.provider import LLMProvider


@dataclass
class LatencyStats:
    mean: float
    median: float
    p95: float
    min: float
    max: float


@dataclass
class GenerationStats:
    total_tokens: int
    prompt_tokens_avg: float
    output_tokens_avg: float
    tokens_per_second: float


@dataclass
class BenchmarkResult:
    timestamp: str
    is_amd_benchmark: bool
    hardware: Dict[str, Any]
    model: str
    runs: int
    warmup: int
    latency_ms: Dict[str, float]
    generation: Dict[str, Any]
    time_to_first_token_ms: Optional[float]
    peak_gpu_memory: Optional[str]
    system: Dict[str, Any]
    raw_latencies_ms: List[float] = field(default_factory=list)
    disclaimer: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class LLMBenchmark:
    """Rigorous reproducible benchmarking engine."""

    def __init__(
        self,
        provider: Optional[LLMProvider] = None,
        model_name: Optional[str] = None,
    ):
        self.config = get_config()
        self.device_info = detect_device()
        self.model_name = model_name or self.config.model_name

        if provider is not None:
            self.provider = provider
        elif self.config.provider == "local":
            self.provider = LocalProvider(model_name=self.model_name)
        else:
            self.provider = MockProvider(model_name=self.model_name)

    def run(
        self,
        prompt: str = "Analyser la dérive vibratoire sur palier broche CNC et proposer la procédure ISO 10816.",
        runs: int = 5,
        warmup: int = 2,
        max_tokens: int = 256,
    ) -> BenchmarkResult:
        """Execute benchmark with warmup runs, real timers, and strict statistics."""
        is_amd = (
            self.device_info.device == "amd"
            and self.device_info.accelerator == "rocm"
            and self.device_info.available
        )

        disclaimer = None
        if not is_amd:
            disclaimer = (
                "AMD ROCm GPU not detected. Benchmark will not be reported as an AMD benchmark. "
                "Executed on CPU / Development baseline."
            )

        # Peak VRAM measurement setup if PyTorch is available
        peak_vram_str = None
        torch_mod = None
        try:
            import torch  # type: ignore
            torch_mod = torch
            if torch.cuda.is_available():
                torch.cuda.reset_peak_memory_stats()
        except Exception:
            pass

        # 1. Warmup runs
        for _ in range(max(0, warmup)):
            try:
                self.provider.generate(prompt=prompt, max_tokens=max_tokens)
            except Exception:
                pass

        # 2. Measured runs
        latencies: List[float] = []
        output_tokens_list: List[int] = []
        prompt_tokens_list: List[int] = []
        first_token_latencies: List[float] = []

        total_start = time.perf_counter()

        for _ in range(max(1, runs)):
            t0 = time.perf_counter()
            res = self.provider.generate(prompt=prompt, max_tokens=max_tokens)
            elapsed_ms = (time.perf_counter() - t0) * 1000.0

            latencies.append(round(elapsed_ms, 2))
            output_tokens_list.append(res.completion_tokens)
            prompt_tokens_list.append(res.prompt_tokens)
            if res.time_to_first_token_ms:
                first_token_latencies.append(res.time_to_first_token_ms)

        total_measured_sec = time.perf_counter() - total_start

        # Query Peak GPU Memory after runs
        if torch_mod is not None:
            try:
                if torch_mod.cuda.is_available():
                    peak_bytes = torch_mod.cuda.max_memory_allocated(0)
                    peak_vram_str = f"{peak_bytes / (1024**3):.2f} GB"
            except Exception:
                pass

        # 3. Calculate statistics
        latencies_sorted = sorted(latencies)
        n = len(latencies_sorted)

        mean_lat = sum(latencies) / n
        median_lat = (
            latencies_sorted[n // 2]
            if n % 2 != 0
            else (latencies_sorted[n // 2 - 1] + latencies_sorted[n // 2]) / 2.0
        )
        p95_index = min(n - 1, math.ceil(0.95 * n) - 1)
        p95_lat = latencies_sorted[p95_index]
        min_lat = latencies_sorted[0]
        max_lat = latencies_sorted[-1]

        total_out_tokens = sum(output_tokens_list)
        avg_prompt_tokens = sum(prompt_tokens_list) / n
        avg_output_tokens = total_out_tokens / n

        # Authentic tokens per second calculation based on real elapsed time
        tok_per_sec = total_out_tokens / max(0.001, total_measured_sec)

        avg_ttft = (
            sum(first_token_latencies) / len(first_token_latencies)
            if first_token_latencies
            else None
        )

        hardware_dict = {
            "device": self.device_info.device,
            "accelerator": self.device_info.accelerator,
            "gpu_name": self.device_info.gpu_name or "N/A (CPU Mode)",
            "rocm_version": self.device_info.hip_version or "None",
            "pytorch_version": self.device_info.pytorch_version or "None",
            "memory_total": self.device_info.memory_total or "N/A",
            "memory_available": self.device_info.memory_available or "N/A",
        }

        system_dict = {
            "platform": self.device_info.platform_info,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "provider_type": self.config.provider,
        }

        return BenchmarkResult(
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            is_amd_benchmark=is_amd,
            hardware=hardware_dict,
            model=self.model_name,
            runs=runs,
            warmup=warmup,
            latency_ms={
                "mean": round(mean_lat, 2),
                "median": round(median_lat, 2),
                "p95": round(p95_lat, 2),
                "min": round(min_lat, 2),
                "max": round(max_lat, 2),
            },
            generation={
                "total_tokens": total_out_tokens,
                "prompt_tokens_avg": round(avg_prompt_tokens, 1),
                "output_tokens_avg": round(avg_output_tokens, 1),
                "tokens_per_second": round(tok_per_sec, 2),
            },
            time_to_first_token_ms=round(avg_ttft, 2) if avg_ttft else None,
            peak_gpu_memory=peak_vram_str,
            system=system_dict,
            raw_latencies_ms=latencies,
            disclaimer=disclaimer,
        )
