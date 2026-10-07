#!/usr/bin/env python3
"""INDUXIA V1.4 - LLM & AMD ROCm Benchmark CLI
Executes rigorous latency, throughput, and memory benchmarking.
Truthfully validates whether host has active AMD ROCm acceleration.
"""

import sys
import os
import argparse
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.llm.benchmark import LLMBenchmark
from backend.llm.device import detect_device


def parse_args():
    parser = argparse.ArgumentParser(
        description="INDUXIA V1.4 - Reproducible LLM Inference Benchmark"
    )
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="Model identifier to benchmark (defaults to configured model)",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=5,
        help="Number of measured iteration runs (default: 5)",
    )
    parser.add_argument(
        "--warmup",
        type=int,
        default=2,
        help="Number of unmeasured warmup iterations (default: 2)",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=256,
        help="Maximum generation output tokens (default: 256)",
    )
    parser.add_argument(
        "--prompt",
        type=str,
        default="Analyser la dérive vibratoire sur palier broche CNC et proposer la procédure ISO 10816.",
        help="Input industrial prompt for benchmark",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON format only",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    device = detect_device()

    is_amd = (device.device == "amd" and device.accelerator == "rocm" and device.available)

    if not args.json:
        print("==================================================")
        print("          INDUXIA V1.4 - LLM BENCHMARK            ")
        print("==================================================")
        if not is_amd:
            print("AMD ROCm GPU not detected.")
            print("Benchmark will not be reported as an AMD benchmark.")
            print(f"Executing on baseline: {device.device.upper()} ({device.platform_info})")
            print("--------------------------------------------------")
        else:
            print(f"AMD ROCm GPU Detected: {device.gpu_name}")
            print(f"ROCm / HIP: {device.hip_version}")
            print("--------------------------------------------------")
        print(f"Model       : {args.model or 'Default configured'}")
        print(f"Warmup runs : {args.warmup}")
        print(f"Measured runs: {args.runs}")
        print(f"Max tokens  : {args.max_tokens}")
        print("Starting benchmark runs...\n")

    benchmarker = LLMBenchmark(model_name=args.model)
    result = benchmarker.run(
        prompt=args.prompt,
        runs=args.runs,
        warmup=args.warmup,
        max_tokens=args.max_tokens,
    )

    if args.json:
        print(json.dumps(result.to_dict(), indent=2))
        return

    print("==================================================")
    print("               BENCHMARK RESULTS                  ")
    print("==================================================")
    print(f"Timestamp        : {result.timestamp}")
    print(f"Certified AMD    : {'YES (ROCm Accelerated)' if result.is_amd_benchmark else 'NO (CPU/Baseline Only)'}")
    print(f"Hardware GPU     : {result.hardware.get('gpu_name')}")
    print(f"Model Tested     : {result.model}")
    print(f"Runs / Warmup    : {result.runs} measured / {result.warmup} warmup")
    print("Latency Statistics (ms):")
    print(f"  - Median       : {result.latency_ms['median']} ms")
    print(f"  - p95          : {result.latency_ms['p95']} ms")
    print(f"  - Mean         : {result.latency_ms['mean']} ms")
    print(f"  - Min / Max    : {result.latency_ms['min']} ms / {result.latency_ms['max']} ms")
    if result.time_to_first_token_ms:
        print(f"Time to 1st Tok  : {result.time_to_first_token_ms} ms")
    print("Throughput:")
    print(f"  - Tokens/sec   : {result.generation['tokens_per_second']} tok/s")
    print(f"  - Output Tokens: {result.generation['total_tokens']} total (avg {result.generation['output_tokens_avg']}/run)")
    if result.peak_gpu_memory:
        print(f"Peak GPU VRAM    : {result.peak_gpu_memory}")
    if result.disclaimer:
        print("\nNotice:")
        print(f"  * {result.disclaimer}")
    print("==================================================")


if __name__ == "__main__":
    main()
