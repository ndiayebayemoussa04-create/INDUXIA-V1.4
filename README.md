# INDUXIA V1.4 — Industrial AI & Resilience Platform
*Moteur d'Intelligence Artificielle Locale Compatible AMD ROCm & Mode Résilient CPU*

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](VERSION)
[![Hardware](https://img.shields.io/badge/AMD%20ROCm-Ready%20%2F%20CPU%20Fallback-red.svg)](docs/AMD_ROCM_SETUP.md)
[![License](https://img.shields.io/badge/Licence-Souveraine%20Industrielle-green.svg)](#)

---

## 1. Présentation & Objectifs V1.4

**INDUXIA V1.4** fait évoluer la plateforme industrielle INDUXIA V1.3 vers une architecture d'IA locale souveraine.
Elle apporte l'intégration complète d'un **moteur LLM local compatible AMD ROCm** et d'un mode de développement/résilience CPU, tout en préservant l'intégralité des fonctionnalités V1.3 :
- Supervision télémétrique du parc machine (CNC, Presses, Turbines, Bras robotisés).
- Alertes prédictives et détection d'anomalies vibratoires/thermiques.
- Base de connaissances RAG certifiée (ISO 10816, ISO 13374, manuels constructeurs OEM).
- Copilote industriel interactif bilingue (Français & Anglais) avec protocole d'inhibition anti-hallucination.
- Gouvernance stricte **Human-in-the-Loop** : aucune modification de consigne ni arrêt d'équipement n'est exécuté sans validation explicite d'un opérateur qualifié.
- Découverte matérielle sans falsification : **aucun benchmark AMD n'est simulé ou inventé**.

> **Note de Transparence Matérielle** :
> *ROCm implementation prepared. Real AMD validation pending on compatible AMD hardware.*
> Sur tout environnement dépourvu de carte AMD compatible, le système fonctionne de manière fluide en mode CPU / MockProvider certifié et signale explicitement que l'accélération ROCm n'est pas active.

---

## 2. Architecture V1.4

```
INDUXIA_v1_4_AMD_ROCM_LOCAL_AI/
├── backend/
│   ├── llm/
│   │   ├── config.py         # Configuration centralisée
│   │   ├── device.py         # Détection matérielle AMD ROCm / HIP / CPU
│   │   ├── provider.py       # Interface abstraite LLMProvider
│   │   ├── mock_provider.py  # Provider déterministe CPU / Tests
│   │   ├── local_provider.py # Connecteur local OpenAI-compatible
│   │   ├── benchmark.py      # Moteur de benchmark reproductible
│   │   └── diagnostics.py    # Diagnostic système et santé des composants
│   └── api/
│       ├── llm.py            # Endpoints LLM, statut, génération, diagnostics
│       └── benchmark.py      # Endpoints d'exécution et historique de benchmark
├── scripts/
│   ├── doctor.py             # Diagnostic CLI interactif
│   └── benchmark_llm.py      # Outil de benchmark en ligne de commande
├── docs/
│   ├── ARCHITECTURE_V1_4.md  # Architecture détaillée du système
│   ├── AMD_ROCM_SETUP.md     # Guide officiel de déploiement AMD ROCm
│   ├── BENCHMARK_PROTOCOL.md # Protocole de mesure de latence et débit
│   └── LLM_MODELS.md         # Catalogue et dimensionnement des modèles
├── requirements/
│   ├── requirements-cpu.txt  # Environnements de dev / Mac / CPU
│   └── requirements-rocm.txt # Stations de calcul accélérées AMD ROCm
├── tests/                    # Suite de tests automatisés (27 cas de test)
├── server.ts                 # Serveur Express fullstack & middleware Vite
├── src/                      # Interface web industrielle React 19 + Tailwind
└── VERSION                   # 1.4.0
```

---

## 3. Installation Rapide

### Mode CPU / Développement (Mac, Linux de base, CI/CD)
```bash
# 1. Installer les dépendances Node.js (déjà prêtes dans l'applet)
npm install

# 2. (Optionnel pour CLI Python)
pip install -r requirements/requirements-cpu.txt
```

### Mode Accéléré AMD ROCm (Serveur ou Station Linux avec GPU AMD)
Consultez le guide détaillé : [`docs/AMD_ROCM_SETUP.md`](docs/AMD_ROCM_SETUP.md).
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/rocm6.1
pip install -r requirements/requirements-rocm.txt
```

---

## 4. Commandes Utiles

### A. Lancer la Plateforme Web (Port 3000)
```bash
npm run dev
```
Ouvre le tableau de bord complet avec le panneau **AMD AI ENGINE**, la télémétrie des machines, les alertes, le RAG et le Copilote.

### B. Exécuter le Diagnostic Système
```bash
python3 scripts/doctor.py
```

### C. Lancer le Benchmark Matériel
```bash
python3 scripts/benchmark_llm.py --runs 5 --warmup 2 --max-tokens 256
```

### D. Exécuter la Suite de Tests
```bash
python3 -m unittest discover tests
```

---

## 5. Endpoints de l'API REST

- `GET /api/version` : Version et nom de code (`1.4.0`, codename: `AMD ROCm Local AI Engine`)
- `GET /api/llm/status` : Statut du provider actif, base URL, détection du GPU
- `GET /api/llm/models` : Modèles supportés et configuration de contexte
- `POST /api/llm/generate` : Inférence souveraine avec filtrage et validation humaine
- `GET /api/system/diagnostics` : Rapport complet de santé (OS, Python, PyTorch, ROCm, RAG, Copilote)
- `POST /api/benchmark/run` : Lancement d'un benchmark mesuré
- `GET /api/benchmark/results` : Historique des mesures
- `GET /api/download/zip` : Téléchargement de l'archive `INDUXIA_v1_4_AMD_ROCM_LOCAL_AI.zip`
