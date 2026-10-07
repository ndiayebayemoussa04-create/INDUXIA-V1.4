"""INDUXIA V1.4 - Mock LLM Provider
Deterministic, high-fidelity local provider for development, tests, and CPU mode.
Adheres strictly to industrial safety rules and Human-In-The-Loop contracts.
"""

import time
import math
from typing import Dict, Any, Iterator, Optional, List
from backend.llm.provider import LLMProvider, GenerationResult, StreamChunk
from backend.llm.device import detect_device


class MockProvider(LLMProvider):
    """Deterministic offline provider simulating industrial LLM reasoning."""

    def __init__(self, model_name: str = "INDUXIA-Industrial-Mock-7B"):
        self.model_name = model_name
        self.device_info = detect_device()

    def generate(self, prompt: str, **kwargs) -> GenerationResult:
        start_time = time.perf_counter()
        language = kwargs.get("language", "fr").lower()
        context_sources = kwargs.get("context_sources", [])
        system_prompt = kwargs.get("system_prompt", "")

        # Simulate minimal processing latency (realistic 45-80ms)
        time.sleep(0.05)

        # Detect intent and formulate grounded response
        response_text, sources_used, proposed_actions, requires_val = self._synthesize_response(
            prompt=prompt,
            language=language,
            context_sources=context_sources,
        )

        prompt_tokens = max(1, len(prompt.split()) + len(system_prompt.split()) * 2)
        completion_tokens = max(1, len(response_text.split()))
        total_tokens = prompt_tokens + completion_tokens
        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return GenerationResult(
            text=response_text,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            latency_ms=round(latency_ms, 2),
            model=self.model_name,
            provider="mock",
            device=self.device_info.device,
            time_to_first_token_ms=round(latency_ms * 0.3, 2),
            finish_reason="stop",
            confidence_level=0.96 if sources_used else 0.40,
            sources_used=sources_used,
            requires_human_validation=requires_val,
            proposed_actions=proposed_actions,
        )

    def generate_stream(self, prompt: str, **kwargs) -> Iterator[StreamChunk]:
        res = self.generate(prompt, **kwargs)
        words = res.text.split(" ")
        accumulated = 0
        for i, word in enumerate(words):
            accumulated += 1
            is_last = i == len(words) - 1
            yield StreamChunk(
                delta=word + (" " if not is_last else ""),
                is_final=is_last,
                tokens_so_far=accumulated,
                finish_reason="stop" if is_last else None
            )
            time.sleep(0.01)

    def health(self) -> Dict[str, Any]:
        return {
            "status": "ok",
            "provider": "mock",
            "model": self.model_name,
            "device": self.device_info.device,
            "accelerator": self.device_info.accelerator,
            "message": "Mock provider operational for CPU development and deterministic test suites.",
        }

    def model_info(self) -> Dict[str, Any]:
        return {
            "model_id": self.model_name,
            "provider": "mock",
            "parameters": "7B (Simulated)",
            "context_length": 8192,
            "quantization": "FP16 / Int4 Equivalent",
            "runtime": "Native Python Process",
            "local_sovereign": True,
        }

    def _synthesize_response(
        self,
        prompt: str,
        language: str,
        context_sources: List[Dict[str, Any]],
    ) -> tuple[str, List[str], List[Dict[str, Any]], bool]:
        """Produce structured response according to Section 8 format."""
        p_lower = prompt.lower()

        # Check if query is about vibration or bearing or temperature or maintenance
        is_fr = language.startswith("fr")

        # Insufficient documentation guardrail test (strict non-industrial / out-of-scope inhibition)
        if any(w in p_lower for w in [
            "recette", "cuisine", "poeme", "poème", "fiction",
            "cryptomonnaie", "crypto", "blague", "musique", "chanson", "politique"
        ]):
            msg = (
                "Informations insuffisantes dans la documentation disponible. "
                "INDUXIA est restreint au périmètre industriel et opérationnel certifié."
                if is_fr else
                "Insufficient information in available documentation. "
                "INDUXIA is restricted to certified industrial and operational scopes."
            )
            return msg, [], [], False

        # Machine anomaly diagnostics & operational commands (CNC, Press, Turbine, Bearing, Vibration, Spindle, Temperature, etc.)
        if any(w in p_lower for w in [
            "vibration", "palier", "roulement", "température", "temperature",
            "thermique", "broche", "spindle", "dérive", "derive",
            "press", "cnc", "turbine", "anomalie", "cause", "maintenance",
            "machine", "arrêt", "arreter", "arrêter", "stop", "consigne",
            "vitesse", "action", "commande", "sécurité", "securite", "iso"
        ]):
            sources = [
                "ISO 10816-3 (Norme Vibrations Machines Industrielles)",
                "Manuel Constructeur Broche CNC-04 (Rév. D - Chap. 7.4)",
                "Procédure SOP-MNT-2024-08 (Remplacement Palier & Graissage)",
            ]
            actions = [
                {
                    "action_id": "ACT-701",
                    "type": "SETPOINT_ADJUSTMENT",
                    "target": "CNC Milling Unit 04 / Broche Principal",
                    "parameter": "Vitesse d'avance / Feed Rate",
                    "proposed_value": "-25% (Mode Sécurité Préventif)",
                    "requires_approval": True,
                    "risk_level": "MEDIUM",
                },
                {
                    "action_id": "ACT-702",
                    "type": "WORK_ORDER_CREATION",
                    "target": "Ligne B - Poste 4",
                    "parameter": "Inspection Endoscopique & Re-graissage SKF LGHP 2",
                    "proposed_value": "Intervention sous 4 heures",
                    "requires_approval": True,
                    "risk_level": "LOW",
                }
            ]

            if is_fr:
                text = (
                    "OBSERVATIONS:\n"
                    "- Dérive vibratoire mesurée à 5.8 mm/s RMS (seuil d'alerte ISO Classe II : 4.5 mm/s).\n"
                    "- Élévation thermique du palier arrière à 74°C (dérive +18°C par rapport à la température nominale).\n\n"
                    "INFERENCE:\n"
                    "- Dégradation précoce du film lubrifiant sur la bague externe du palier arrière, entraînant un micro-écaillage potentiel.\n"
                    "- Risque de blocage broche estimé sous 18 heures sans intervention de maintenance.\n\n"
                    "DOCUMENTATION:\n"
                    "- Conforme à la norme ISO 10816-3 Zone C (fonctionnement limité admissible).\n"
                    "- SOP-MNT-2024-08 prescrit une réduction de charge de 25% et une analyse spectrale FFT haute fréquence.\n\n"
                    "RECOMMANDATION (Soumise à validation humaine):\n"
                    "1. Réduire temporairement la consigne d'avance de 25% pour préserver l'intégrité de la broche.\n"
                    "2. Émettre un ordre de travail préventif pour vérification du graissage et contrôle du jeu axial.\n"
                    "3. Validation requise par le superviseur de ligne avant toute modification de paramètre."
                )
            else:
                text = (
                    "OBSERVATIONS:\n"
                    "- Vibration drift measured at 5.8 mm/s RMS (ISO Class II warning threshold: 4.5 mm/s).\n"
                    "- Rear bearing thermal increase to 74°C (+18°C deviation above nominal operating baseline).\n\n"
                    "INFERENCE:\n"
                    "- Early lubricant film breakdown on rear bearing outer race, leading to prospective micro-spalling.\n"
                    "- Risk of spindle seizure estimated within 18 hours without maintenance intervention.\n\n"
                    "DOCUMENTATION:\n"
                    "- Complies with ISO 10816-3 Zone C criteria (restricted runtime allowed).\n"
                    "- SOP-MNT-2024-08 prescribes an immediate 25% load decrease and high-frequency FFT spectral inspection.\n\n"
                    "RECOMMENDATION (Subject to Human Validation):\n"
                    "1. Temporarily decrease feed rate setpoint by 25% to protect spindle integrity.\n"
                    "2. Issue a preventive work order for SKF LGHP 2 re-lubrication and axial play check.\n"
                    "3. Mandatory supervisor approval required prior to any machine setpoint alteration."
                )
            return text, sources, actions, True

        # General inquiry
        sources = ["Guide d'Exploitation INDUXIA V1.4 (AMD ROCm Sovereign Edition)"]
        if is_fr:
            text = (
                "OBSERVATIONS:\n"
                "- Système INDUXIA V1.4 opérationnel en environnement souverain local.\n\n"
                "INFERENCE:\n"
                "- Les sous-systèmes de télémétrie, RAG documentaire et inférence locale sont synchronisés.\n\n"
                "DOCUMENTATION:\n"
                "- Architecture V1.4 - Moteur d'IA locale AMD ROCm & mode CPU résilient.\n\n"
                "RECOMMANDATION:\n"
                "- Interrogez le Copilote sur un équipement spécifique (CNC-04, Presse HP-12, Turbine TG-02) ou lancez un diagnostic."
            )
        else:
            text = (
                "OBSERVATIONS:\n"
                "- INDUXIA V1.4 platform operating in local sovereign environment.\n\n"
                "INFERENCE:\n"
                "- Telemetry subsystems, RAG knowledge retrieval, and local inference are aligned.\n\n"
                "DOCUMENTATION:\n"
                "- Architecture V1.4 - AMD ROCm Local AI Engine & Resilient CPU Fallback.\n\n"
                "RECOMMENDATION:\n"
                "- Query Copilot regarding a specific asset (CNC-04, HP-12 Press, TG-02 Turbine) or run system diagnostics."
            )
        return text, sources, [], False
