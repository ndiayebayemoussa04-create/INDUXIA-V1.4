"""INDUXIA V1.4 - Central Configuration
Handles configuration loading from environment variables with safe defaults.
"""

import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class LLMConfig:
    version: str = "1.4.0"
    provider: str = "mock"  # "mock" or "local"
    model_name: str = "Qwen2.5-7B-Instruct"
    base_url: str = "http://localhost:11434/v1"
    timeout: float = 30.0
    max_tokens: int = 512
    temperature: float = 0.2
    accelerator: str = "auto"
    host: str = "0.0.0.0"
    port: int = 8000

    @classmethod
    def from_env(cls) -> "LLMConfig":
        return cls(
            version=os.getenv("INDUXIA_VERSION", "1.4.0"),
            provider=os.getenv("INDUXIA_LLM_PROVIDER", "mock").lower().strip(),
            model_name=os.getenv("INDUXIA_MODEL_NAME", "Qwen2.5-7B-Instruct"),
            base_url=os.getenv("INDUXIA_LLM_BASE_URL", "http://localhost:11434/v1").rstrip("/"),
            timeout=float(os.getenv("INDUXIA_LLM_TIMEOUT", "30.0")),
            max_tokens=int(os.getenv("INDUXIA_MAX_TOKENS", "512")),
            temperature=float(os.getenv("INDUXIA_TEMPERATURE", "0.2")),
            accelerator=os.getenv("INDUXIA_ACCELERATOR", "auto").lower().strip(),
            host=os.getenv("INDUXIA_HOST", "0.0.0.0"),
            port=int(os.getenv("INDUXIA_API_PORT", "8000")),
        )


_config_instance: Optional[LLMConfig] = None


def get_config() -> LLMConfig:
    """Retrieve global cached or freshly initialized LLMConfig."""
    global _config_instance
    if _config_instance is None:
        _config_instance = LLMConfig.from_env()
    return _config_instance


def reload_config() -> LLMConfig:
    """Reload configuration from environment variables."""
    global _config_instance
    _config_instance = LLMConfig.from_env()
    return _config_instance
