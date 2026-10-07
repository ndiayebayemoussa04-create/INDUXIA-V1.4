"""INDUXIA V1.4 - LLM & Diagnostic Endpoints
Implements status, model listings, generation, and diagnostic inspections.
Supports FastAPI when available and provides standalone dispatchers.
"""

from typing import Dict, Any, Optional, List
from backend.llm.config import get_config
from backend.llm.device import detect_device
from backend.llm.mock_provider import MockProvider
from backend.llm.local_provider import LocalProvider
from backend.llm.diagnostics import run_diagnostics


def get_version_info() -> Dict[str, str]:
    """GET /api/version"""
    return {
        "name": "INDUXIA",
        "version": "1.4.0",
        "codename": "AMD ROCm Local AI Engine",
    }


def get_llm_status() -> Dict[str, Any]:
    """GET /api/llm/status"""
    cfg = get_config()
    dev = detect_device()
    provider = (
        LocalProvider(model_name=cfg.model_name)
        if cfg.provider == "local"
        else MockProvider(model_name=cfg.model_name)
    )
    health = provider.health()

    return {
        "provider": cfg.provider,
        "model": cfg.model_name,
        "base_url": cfg.base_url,
        "device": dev.device,
        "accelerator": dev.accelerator,
        "rocm_available": (dev.device == "amd" and dev.accelerator == "rocm" and dev.available),
        "health": health,
        "timeout": cfg.timeout,
        "max_tokens": cfg.max_tokens,
        "temperature": cfg.temperature,
    }


def get_llm_models() -> Dict[str, Any]:
    """GET /api/llm/models"""
    cfg = get_config()
    dev = detect_device()
    models = [
        {
            "id": cfg.model_name,
            "name": f"{cfg.model_name} (Active)",
            "context_window": 8192,
            "quantization": "Q4_K_M / Int4",
            "recommended_vram": "6-12 GB",
            "target_hardware": "AMD ROCm (Radeon RX 7900 / Instinct MI300) or CPU",
            "current": True,
        },
        {
            "id": "Llama-3.1-8B-Instruct",
            "name": "Meta Llama 3.1 8B Instruct",
            "context_window": 8192,
            "quantization": "AWQ / Q4",
            "recommended_vram": "8 GB",
            "target_hardware": "AMD ROCm",
            "current": False,
        },
        {
            "id": "Mistral-7B-Instruct-v0.3",
            "name": "Mistral 7B Instruct v0.3",
            "context_window": 32768,
            "quantization": "GGUF Q4_K_S",
            "recommended_vram": "6 GB",
            "target_hardware": "AMD ROCm / CPU",
            "current": False,
        },
    ]
    return {
        "active_model": cfg.model_name,
        "provider": cfg.provider,
        "device": dev.device,
        "models": models,
    }


def handle_generate(payload: Dict[str, Any]) -> Dict[str, Any]:
    """POST /api/llm/generate"""
    prompt = payload.get("prompt", "").strip()
    if not prompt:
        return {
            "error": "Prompt cannot be empty",
            "status": "failed",
        }

    # Security check: maximum prompt length
    if len(prompt) > 8000:
        return {
            "error": "Prompt exceeds maximum allowed length of 8000 characters",
            "status": "rejected",
        }

    cfg = get_config()
    provider_name = payload.get("provider", cfg.provider)
    model_name = payload.get("model", cfg.model_name)
    language = payload.get("language", "fr")
    context_sources = payload.get("context_sources", [])

    provider = (
        LocalProvider(model_name=model_name)
        if provider_name == "local"
        else MockProvider(model_name=model_name)
    )

    result = provider.generate(
        prompt=prompt,
        language=language,
        context_sources=context_sources,
        max_tokens=payload.get("max_tokens", cfg.max_tokens),
        temperature=payload.get("temperature", cfg.temperature),
    )

    return result.to_dict()


def get_diagnostics() -> Dict[str, Any]:
    """GET /api/system/diagnostics"""
    return run_diagnostics().to_dict()
