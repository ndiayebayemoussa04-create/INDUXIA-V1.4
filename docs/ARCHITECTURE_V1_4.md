# INDUXIA V1.4 — Architecture Industrielle & Moteur IA Local AMD ROCm

## 1. Vision et Objectifs V1.4

INDUXIA V1.4 fait évoluer la plateforme de résilience industrielle V1.3 en intégrant un **moteur d'intelligence artificielle locale souverain compatible AMD ROCm**.
L'objectif central est de garantir une autonomie complète sur site industriel (Edge / On-Premise) sans dépendance critique à des API cloud externes, avec :
- Détection matérielle rigoureuse (AMD ROCm, NVIDIA CUDA, CPU fallback).
- Aucun benchmark inventé : transparence absolue des performances mesurées.
- Architecture Human-in-the-Loop : aucune action critique n'est exécutée directement par le modèle.
- RAG industriel certifié (ISO 10816, ISO 13374, manuels OEM).
- Bilinguisme natif (Français & Anglais).

---

## 2. Arborescence Modulaire

```
INDUXIA_v1_4_AMD_ROCM_LOCAL_AI/
├── backend/
│   ├── __init__.py
│   ├── main.py                  # Point d'entrée serveur Python (FastAPI/WSGI/HTTP)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── llm.py               # Endpoints statut, modèles, génération, diagnostics
│   │   └── benchmark.py         # Endpoints exécution et historique des benchmarks
│   └── llm/
│       ├── __init__.py
│       ├── config.py            # Configuration centralisée (.env)
│       ├── device.py            # Découverte matérielle AMD ROCm / HIP / CPU
│       ├── provider.py          # Interface abstraite LLMProvider
│       ├── mock_provider.py     # Provider déterministe hors-ligne (CPU / dev / CI)
│       ├── local_provider.py    # Connecteur local OpenAI-compatible (vLLM, Ollama, etc.)
│       ├── benchmark.py         # Moteur de benchmark reproductible et certifié
│       └── diagnostics.py       # Diagnostic système et santé matérielle
├── scripts/
│   ├── doctor.py                # CLI de diagnostic système complet
│   └── benchmark_llm.py         # CLI de benchmark matériel
├── docs/
│   ├── ARCHITECTURE_V1_4.md
│   ├── AMD_ROCM_SETUP.md
│   ├── BENCHMARK_PROTOCOL.md
│   └── LLM_MODELS.md
├── requirements/
│   ├── requirements-cpu.txt     # Dépendances mode CPU (Mac, Linux de base)
│   └── requirements-rocm.txt    # Dépendances pour GPU AMD ROCm (PyTorch HIP)
├── tests/
│   ├── test_llm_provider.py
│   ├── test_device_detection.py
│   ├── test_benchmark.py
│   ├── test_llm_api.py
│   └── test_copilot_v14.py
├── .env.example
├── VERSION
└── README.md
```

---

## 3. Flux Opérationnel du Copilote V1.4

```
   Opérateur Industriel / Événement Télémétrique
                      ↓
               Copilote INDUXIA
                      ↓
            Analyse d'Intention
                      ↓
               Recherche RAG
       (ISO 10816, Manuels Machines, SOP)
                      ↓
            Sources Industrielles
                      ↓
         Prompt Sécurisé Structuré
  (OBSERVATION / INFERENCE / DOCUMENTATION / RECOMMANDATION)
                      ↓
       Moteur IA Local (ROCm / CPU / Mock)
                      ↓
            Synthèse d'Inférence
                      ↓
             Attribution Sources
                      ↓
      Proposition d'Action (SETPOINT / ODT)
                      ↓
           [VALIDATION HUMAINE REQUISE]
       (Approbation Superviseur / Rejet)
```

---

## 4. Règles de Sécurité et Non-Régression

1. **Isolation locale** : Inférence s'exécutant sur `localhost` sans télémétrie non sollicitée ni fuite de données d'usine.
2. **Bornage des entrées** : Longueur maximale du prompt limitée à 8000 caractères, rejet des commandes shell ou injections système.
3. **Zéro hallucination** : Si les documents RAG ne contiennent pas la réponse, le modèle répond impérativement :
   *"Informations insuffisantes dans la documentation disponible."*
4. **Human-in-the-Loop invariant** : Le LLM est strictement cantonné au rôle **OBSERVE + PROPOSE**. La modification de consigne vitesse/pression ou l'arrêt d'une machine requiert la validation explicite d'un opérateur qualifié.
