# Guide d'Installation AMD ROCm — INDUXIA V1.4

Ce guide détaille la mise en service d'INDUXIA V1.4 sur station de travail ou serveur équipé d'un GPU AMD Radeon™ ou AMD Instinct™ sous Linux.

> **AVERTISSEMENT OFFICIEL** :
> Ne tentez pas d'installer ROCm sur macOS (utilisez le mode CPU / développement natif).
> Les commandes exactes d'installation de ROCm et de PyTorch ROCm dépendent de votre distribution Linux (Ubuntu, RHEL, SLES), de la génération de votre GPU (RDNA 3, RDNA 2, CDNA 2/3) et de la version de ROCm ciblée.
> Consultez impérativement la documentation officielle AMD :
> - [AMD ROCm Documentation](https://rocm.docs.amd.com/)
> - [PyTorch ROCm Installation Guide](https://pytorch.org/get-started/locally/)

---

## 1. Matériel Compatible

- **Série AMD Instinct™** : MI300X, MI300A, MI250X, MI210, MI100
- **Série AMD Radeon™ Pro** : W7900, W7800, W6800
- **Série AMD Radeon™ Grand Public** (support communautaire/officiel selon version) :
  - Radeon™ RX 7900 XTX / 7900 XT / 7900 GRE (gfx1100)
  - Radeon™ RX 7800 XT / 7700 XT (gfx1101)
  - Radeon™ RX 6900 XT / 6800 XT (gfx1030)

---

## 2. Prérequis Système

- Système d'exploitation : Ubuntu 22.04 LTS / 24.04 LTS ou RHEL 8/9
- Noyau Linux compatible avec le module noyau `amdgpu`
- Accès `root` ou `sudo`
- Groupes utilisateurs nécessaires : `render` et `video`

```bash
# Ajouter l'utilisateur aux groupes d'accès GPU
sudo usermod -a -G render,video $USER
```

---

## 3. Installation de la pile AMD ROCm

Suivez la documentation officielle pour ajouter les dépôts AMD correspondant à votre distribution.

Exemple standard sous Ubuntu (à vérifier avec la version officielle) :
```bash
# Vérifier la présence du GPU AMD
lspci | grep -i amd

# Installation du paquet rocm (vérifier la version actuelle : 6.0, 6.1 ou 6.2)
sudo apt update
sudo apt install -y rocm-hip-sdk rocm-smi-lib

# Vérifier la détection matérielle
rocm-smi
rocminfo
```

---

## 4. Installation de PyTorch avec support ROCm

Rendez-vous sur [pytorch.org](https://pytorch.org/get-started/locally/) et sélectionnez le sélecteur PyTorch Build avec Compute Platform **ROCm**.

Exemple (adapter selon la version ROCm installée) :
```bash
# Créer et activer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Exemple pour ROCm 6.0 / 6.1 :
pip install torch torchvision --index-url https://download.pytorch.org/whl/rocm6.1

# Installer les dépendances INDUXIA
pip install -r requirements/requirements-rocm.txt
```

### Vérification PyTorch ROCm
```bash
python3 -c "import torch; print('CUDA/ROCm Available:', torch.cuda.is_available()); print('HIP Version:', getattr(torch.version, 'hip', None)); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

Si `torch.version.hip` retourne une version (ex: `6.1.x`) et `torch.cuda.is_available()` est `True`, votre environnement PyTorch est prêt pour l'accélération AMD ROCm.

---

## 5. Moteur d'Inférence Local (Optionnel : vLLM pour ROCm)

Pour une inférence haute performance au format OpenAI `/v1/chat/completions` :
- Vous pouvez compiler ou installer le conteneur Docker officiel vLLM ROCm :
  ```bash
  docker run -it --network=host --device=/dev/kfd --device=/dev/dri \
    --group-add video rocm/vllm:latest \
    python3 -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen2.5-7B-Instruct --port 11434
  ```
- Ou utiliser Ollama / llama.cpp compilé avec `HIPBLAS=ON`.

---

## 6. Configuration INDUXIA V1.4

Éditer le fichier `.env` :
```env
INDUXIA_VERSION=1.4.0
INDUXIA_LLM_PROVIDER=local
INDUXIA_MODEL_NAME="Qwen2.5-7B-Instruct"
INDUXIA_LLM_BASE_URL="http://localhost:11434/v1"
INDUXIA_LLM_TIMEOUT=30
INDUXIA_MAX_TOKENS=512
INDUXIA_TEMPERATURE=0.2
INDUXIA_ACCELERATOR=auto
```

*(Si vous testez sans serveur vLLM actif, positionnez `INDUXIA_LLM_PROVIDER=mock` pour un fonctionnement déterministe immédiat).*

---

## 7. Diagnostic et Vérification

Lancer la commande de vérification INDUXIA :
```bash
python3 scripts/doctor.py
```

Résultat attendu avec accélération AMD active :
```
ROCm: detected
GPU: AMD Radeon RX 7900 XTX (ou AMD Instinct MI300X)
>> AMD ROCm Hardware Acceleration: ACTIVE & VERIFIED
```

Si aucun GPU AMD n'est présent :
```
ROCm: NOT DETECTED
>> AMD ROCm Hardware Acceleration: NOT ACTIVE (Running CPU Fallback)
```

---

## 8. Exécution du Benchmark Réel

```bash
python3 scripts/benchmark_llm.py --runs 5 --warmup 2 --max-tokens 256
```

Le script confirme si le benchmark est certifié AMD ou s'il s'agit d'une référence CPU.
