# Modèles LLM Supportés & Recommandations — INDUXIA V1.4

## 1. Philosophie & Souveraineté Industrielle

INDUXIA V1.4 privilégie des modèles compacts et spécialisés (7B à 14B paramètres), hautement performants en raisonnement technique, capables de fonctionner entièrement **sur site industriel sans connexion externe**.
Aucun modèle volumineux n'est téléchargé automatiquement par l'application : l'administrateur choisit le runtime et le modèle adapté à la VRAM disponible.

---

## 2. Modèles Recommandés

### A. Qwen2.5-7B-Instruct (Modèle de Référence par Défaut)
- **Développeur** : Alibaba Cloud
- **Contexte** : Jusqu'à 32k / 128k tokens
- **Points forts** : Excellent raisonnement logique, multilingue natif (Français irréprochable), suivi strict de consignes d'extraction et de formatage JSON/SOP.
- **VRAM requise** :
  - Int4 / AWQ : ~5.5 GB (parfait pour Radeon RX 7700/7800 XT)
  - Int8 / GGUF Q8 : ~8.5 GB
  - FP16 : ~15.5 GB (Radeon RX 7900 XT/XTX ou Instinct)

### B. Meta Llama-3.1-8B-Instruct
- **Développeur** : Meta
- **Contexte** : 8k à 128k tokens
- **Points forts** : Support étendu de l'écosystème vLLM ROCm, rapidité d'inférence.
- **VRAM requise** :
  - Int4 : ~6.0 GB
  - FP16 : ~16.5 GB

### C. Mistral-7B-Instruct-v0.3
- **Développeur** : Mistral AI
- **Contexte** : 32k tokens
- **Points forts** : Excellente robustesse en extraction documentaire et respect des règles RAG d'abstention en cas d'absence de source.
- **VRAM requise** :
  - GGUF Q4_K_M : ~5.2 GB

---

## 3. Matrice de Compatibilité Runtimes Locaux sur AMD ROCm

| Runtime | Support AMD ROCm | Protocole d'API | Cas d'Usage Idéal |
| :--- | :--- | :--- | :--- |
| **vLLM** | Officiel (Docker `rocm/vllm`) | OpenAI `/v1/chat/completions` | Débit maximal en usine, serveurs multi-utilisateurs |
| **Ollama** | Support ROCm natif Linux | OpenAI `/v1/chat/completions` | Déploiement poste unique opérateur / maintenance |
| **llama.cpp** | Compilation avec `HIPBLAS=ON` | OpenAI `/v1/chat/completions` | Stations légères, utilisation mixte CPU/GPU |
| **MockProvider** | Inclus dans INDUXIA | Python Interne | Développement Mac/Windows, tests unitaires, CI/CD |

---

## 4. Configuration dans INDUXIA

Pour changer de modèle ou de runtime :
```bash
# Dans votre fichier .env :
INDUXIA_LLM_PROVIDER=local
INDUXIA_MODEL_NAME="Qwen2.5-7B-Instruct"
INDUXIA_LLM_BASE_URL="http://localhost:11434/v1"
```
INDUXIA interrogera directement l'endpoint local sans modifier le code de l'application.
