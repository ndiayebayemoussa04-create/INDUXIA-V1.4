"""INDUXIA V1.4 - Benchmark Endpoints
Allows programmatic and dashboard triggering of authentic hardware benchmarks.
"""

from typing import Dict, Any, Optional, List
from backend.llm.benchmark import LLMBenchmark, BenchmarkResult
from backend.llm.config import get_config

# In-memory storage of recent benchmark executions
_benchmark_history: List[Dict[str, Any]] = []


def run_benchmark_endpoint(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """POST /api/benchmark/run"""
    payload = payload or {}
    model = payload.get("model")
    runs = int(payload.get("runs", 5))
    warmup = int(payload.get("warmup", 2))
    max_tokens = int(payload.get("max_tokens", 256))
    prompt = payload.get(
        "prompt",
        "Analyser la dérive vibratoire sur palier broche CNC et proposer la procédure ISO 10816."
    )

    benchmarker = LLMBenchmark(model_name=model)
    result = benchmarker.run(
        prompt=prompt,
        runs=runs,
        warmup=warmup,
        max_tokens=max_tokens,
    )

    res_dict = result.to_dict()
    _benchmark_history.insert(0, res_dict)
    # Keep last 20 runs
    if len(_benchmark_history) > 20:
        _benchmark_history.pop()

    return res_dict


def get_benchmark_results_endpoint() -> Dict[str, Any]:
    """GET /api/benchmark/results"""
    return {
        "count": len(_benchmark_history),
        "results": _benchmark_history,
        "latest": _benchmark_history[0] if _benchmark_history else None,
    }
