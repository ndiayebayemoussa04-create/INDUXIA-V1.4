"""INDUXIA V1.4 - Hardware & AMD ROCm Device Discovery
Truthful hardware detection without fabricated metrics.
Correctly handles PyTorch ROCm mappings (HIP exposes via torch.cuda API).
"""

import os
import platform
import subprocess
import shutil
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any


@dataclass
class DeviceInfo:
    device: str                  # "amd", "nvidia", "cpu"
    accelerator: str             # "rocm", "cuda", "none"
    available: bool              # True if accelerator is active
    gpu_name: Optional[str] = None
    pytorch_version: Optional[str] = None
    hip_version: Optional[str] = None
    cuda_version: Optional[str] = None
    memory_total: Optional[str] = None
    memory_available: Optional[str] = None
    driver_version: Optional[str] = None
    platform_info: Optional[str] = None
    rocm_smi_detected: bool = False
    details: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _check_rocm_cli() -> Dict[str, Any]:
    """Check system for AMD ROCm binaries (rocm-smi, rocminfo, /opt/rocm)."""
    info = {
        "rocm_smi": False,
        "rocminfo": False,
        "opt_rocm_exists": os.path.exists("/opt/rocm"),
        "dev_kfd_exists": os.path.exists("/dev/kfd"),
        "gpu_name": None,
        "rocm_version": None,
    }

    if shutil.which("rocm-smi"):
        info["rocm_smi"] = True
        try:
            out = subprocess.check_output(
                ["rocm-smi", "--showproductname"],
                stderr=subprocess.DEVNULL,
                timeout=2,
                text=True
            )
            for line in out.splitlines():
                if "Card series:" in line or "Product Name:" in line:
                    info["gpu_name"] = line.split(":", 1)[1].strip()
                    break
        except Exception:
            pass

    if shutil.which("rocminfo"):
        info["rocminfo"] = True

    # Check /opt/rocm/.info/version if present
    rocm_ver_file = "/opt/rocm/.info/version"
    if os.path.isfile(rocm_ver_file):
        try:
            with open(rocm_ver_file, "r") as f:
                info["rocm_version"] = f.read().strip()
        except Exception:
            pass

    return info


def detect_device() -> DeviceInfo:
    """Detect computing hardware truthfully.

    On ROCm, PyTorch exposes AMD GPUs through torch.cuda.
    We check torch.version.hip to determine if CUDA API is backed by AMD ROCm.
    """
    sys_platform = f"{platform.system()} {platform.machine()} (Python {platform.python_version()})"
    rocm_cli_info = _check_rocm_cli()

    pytorch_version = None
    torch_available = False

    try:
        import torch  # type: ignore
        torch_available = True
        pytorch_version = getattr(torch, "__version__", None)
        hip_version = getattr(torch.version, "hip", None)
        cuda_version = getattr(torch.version, "cuda", None)
    except ImportError:
        hip_version = None
        cuda_version = None
        torch = None

    # Case 1: PyTorch available with ROCm/HIP support
    if torch_available and torch is not None:
        has_cuda = torch.cuda.is_available()

        # Check if PyTorch was built with ROCm/HIP
        is_rocm_build = hip_version is not None

        if has_cuda and is_rocm_build:
            # AMD ROCm detected through PyTorch HIP
            try:
                gpu_name = torch.cuda.get_device_name(0)
            except Exception:
                gpu_name = rocm_cli_info.get("gpu_name") or "AMD ROCm GPU"

            # Query VRAM if possible
            mem_total_str = None
            mem_avail_str = None
            try:
                total_bytes = torch.cuda.get_device_properties(0).total_memory
                allocated_bytes = torch.cuda.memory_allocated(0)
                mem_total_str = f"{total_bytes / (1024**3):.2f} GB"
                mem_avail_str = f"{(total_bytes - allocated_bytes) / (1024**3):.2f} GB"
            except Exception:
                pass

            return DeviceInfo(
                device="amd",
                accelerator="rocm",
                available=True,
                gpu_name=gpu_name,
                pytorch_version=pytorch_version,
                hip_version=str(hip_version),
                cuda_version=None,
                memory_total=mem_total_str,
                memory_available=mem_avail_str,
                platform_info=sys_platform,
                rocm_smi_detected=rocm_cli_info["rocm_smi"],
                details="AMD ROCm GPU detected via PyTorch HIP runtime",
            )

        # Case 2: PyTorch has CUDA available, but check if device name contains AMD / Radeon / Instinct
        if has_cuda:
            try:
                device_name = torch.cuda.get_device_name(0)
            except Exception:
                device_name = "Unknown GPU"

            name_lower = device_name.lower()
            if "amd" in name_lower or "radeon" in name_lower or "instinct" in name_lower or "gfx" in name_lower:
                mem_total_str = None
                mem_avail_str = None
                try:
                    total_bytes = torch.cuda.get_device_properties(0).total_memory
                    allocated_bytes = torch.cuda.memory_allocated(0)
                    mem_total_str = f"{total_bytes / (1024**3):.2f} GB"
                    mem_avail_str = f"{(total_bytes - allocated_bytes) / (1024**3):.2f} GB"
                except Exception:
                    pass

                return DeviceInfo(
                    device="amd",
                    accelerator="rocm",
                    available=True,
                    gpu_name=device_name,
                    pytorch_version=pytorch_version,
                    hip_version=str(hip_version) if hip_version else "HIP Runtime (ROCm)",
                    cuda_version=None,
                    memory_total=mem_total_str,
                    memory_available=mem_avail_str,
                    platform_info=sys_platform,
                    rocm_smi_detected=rocm_cli_info["rocm_smi"],
                    details="AMD GPU detected via PyTorch CUDA interface",
                )
            else:
                # NVIDIA GPU detected
                return DeviceInfo(
                    device="nvidia",
                    accelerator="cuda",
                    available=True,
                    gpu_name=device_name,
                    pytorch_version=pytorch_version,
                    hip_version=None,
                    cuda_version=str(cuda_version) if cuda_version else None,
                    platform_info=sys_platform,
                    details="NVIDIA GPU detected (Non-AMD environment)",
                )

    # Case 3: PyTorch not installed or CUDA/ROCm not active
    # Check if ROCm system drivers exist on Linux even if PyTorch is CPU-only
    if rocm_cli_info["rocm_smi"] or rocm_cli_info["dev_kfd_exists"]:
        return DeviceInfo(
            device="amd",
            accelerator="rocm",
            available=False,
            gpu_name=rocm_cli_info.get("gpu_name") or "AMD Hardware Driver Detected",
            pytorch_version=pytorch_version,
            hip_version=rocm_cli_info.get("rocm_version"),
            platform_info=sys_platform,
            rocm_smi_detected=True,
            details="AMD ROCm system drivers detected, but PyTorch ROCm wheels not active in Python environment",
        )

    # Default fallback: pure CPU environment (Mac, Linux CPU, dev sandbox)
    return DeviceInfo(
        device="cpu",
        accelerator="none",
        available=False,
        gpu_name=None,
        pytorch_version=pytorch_version,
        hip_version=None,
        cuda_version=None,
        memory_total=None,
        memory_available=None,
        platform_info=sys_platform,
        rocm_smi_detected=False,
        details="Standard CPU execution environment. No AMD ROCm accelerator detected.",
    )


if __name__ == "__main__":
    import json
    dev = detect_device()
    print(json.dumps(dev.to_dict(), indent=2))
