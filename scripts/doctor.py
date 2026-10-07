#!/usr/bin/env python3
"""INDUXIA V1.4 - System Doctor CLI
Verifies platform integrity, AMD ROCm discovery, RAG, and Copilot.
Usage:
    python scripts/doctor.py
"""

import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.llm.diagnostics import format_doctor_cli, run_diagnostics


def main():
    output = format_doctor_cli()
    print(output)
    diag = run_diagnostics()
    # Exit 0 if system is healthy in either CPU or ROCm mode
    if diag.copilot_status == "OK":
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
