"""INDUXIA V1.4 - LLM Provider Interface
Abstract base class and data structures for local and simulated LLM inference.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict, field
from typing import Optional, Dict, Any, Iterator, List


@dataclass
class GenerationRequest:
    prompt: str
    system_prompt: Optional[str] = None
    max_tokens: int = 512
    temperature: float = 0.2
    language: str = "fr"  # "fr" or "en"
    context_sources: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GenerationResult:
    text: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    latency_ms: float
    model: str
    provider: str
    device: str
    time_to_first_token_ms: Optional[float] = None
    finish_reason: str = "stop"
    confidence_level: float = 0.95
    sources_used: List[str] = field(default_factory=list)
    requires_human_validation: bool = False
    proposed_actions: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class StreamChunk:
    delta: str
    is_final: bool = False
    tokens_so_far: int = 0
    finish_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class LLMProvider(ABC):
    """Abstract interface for all INDUXIA LLM backends."""

    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> GenerationResult:
        """Generate a complete text completion synchronously."""
        pass

    @abstractmethod
    def generate_stream(self, prompt: str, **kwargs) -> Iterator[StreamChunk]:
        """Generate streamed text chunks."""
        pass

    @abstractmethod
    def health(self) -> Dict[str, Any]:
        """Verify provider availability and runtime connectivity."""
        pass

    @abstractmethod
    def model_info(self) -> Dict[str, Any]:
        """Retrieve loaded model specifications and metadata."""
        pass
