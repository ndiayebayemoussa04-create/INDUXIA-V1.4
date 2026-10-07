# Protocole de Mesure & de Benchmark — INDUXIA V1.4

## 1. Principe Fondateur : Zéro Benchmark Fictif

Dans INDUXIA V1.4, **aucune métrique de performance matérielle ne doit être inventée ou simulée**.
Une valeur de latence, de débit (tokens/seconde) ou d'utilisation mémoire VRAM ne peut être qualifiée de "Performance AMD" que si :
1. Le périphérique est formellement détecté comme AMD Radeon™ ou AMD Instinct™ via `torch.version.hip` ou `rocm-smi`.
2. Les mesures temporelles sont effectuées à l'aide de compteurs haute résolution (`time.perf_counter()`).
3. Les exécutions de chauffe (*warmup*) sont réalisées pour stabiliser la compilation des kernels JIT et l'allocation mémoire.
4. Si l'environnement ne dispose pas de GPU AMD, le résultat est obligatoirement libellé comme référence CPU / baseline de développement.

---

## 2. Variables du Protocole

| Paramètre | Description | Valeur par défaut |
| :--- | :--- | :--- |
| **Modèle** | Modèle LLM instancié localement | `Qwen2.5-7B-Instruct` |
| **Quantification** | Format de poids (FP16, Int8, Int4 AWQ/GGUF) | Documenté selon le runtime |
| **Warmup Runs** | Passes d'échauffement non mesurées | 2 passes |
| **Measured Runs** | Nombre d'itérations mesurées statistiquement | 5 passes |
| **Max Output Tokens** | Longueur maximale de génération | 256 tokens |
| **Prompt Standard** | Invite industrielle représentative | *"Analyser la dérive vibratoire sur palier broche CNC et proposer la procédure ISO 10816."* |

---

## 3. Grandeurs Mesurées

- **Latence totale par passe ($T_{\text{lat}}$)** : Temps écoulé en millisecondes entre l'envoi de la requête et la réception du dernier token.
- **Time To First Token ($TTFT$)** : Délai avant émission du premier token lors du streaming.
- **Tokens par seconde ($TPS$)** :
  $$\text{TPS} = \frac{\sum_{i=1}^{N} \text{Tokens générés}_i}{\sum_{i=1}^{N} T_i}$$
- **Statistiques de latence** :
  - **Moyenne** ($\mu$)
  - **Médiane** ($Q_2$)
  - **Centile 95** ($p_{95}$)
  - **Min / Max**
- **Pic de VRAM allouée** : Interrogation via `torch.cuda.max_memory_allocated(0)` si PyTorch est actif.

---

## 4. Format de Sortie Normalisé

```json
{
  "timestamp": "2026-10-07T10:45:00Z",
  "is_amd_benchmark": true,
  "hardware": {
    "device": "amd",
    "accelerator": "rocm",
    "gpu_name": "AMD Radeon RX 7900 XTX",
    "rocm_version": "6.1.2",
    "pytorch_version": "2.3.0+rocm6.1",
    "memory_total": "24.00 GB",
    "memory_available": "21.50 GB"
  },
  "model": "Qwen2.5-7B-Instruct",
  "runs": 5,
  "warmup": 2,
  "latency_ms": {
    "mean": 128.4,
    "median": 125.1,
    "p95": 142.0,
    "min": 119.3,
    "max": 145.2
  },
  "generation": {
    "total_tokens": 768,
    "prompt_tokens_avg": 42.0,
    "output_tokens_avg": 153.6,
    "tokens_per_second": 38.4
  },
  "time_to_first_token_ms": 32.5,
  "peak_gpu_memory": "8.45 GB",
  "system": {
    "platform": "Linux 6.5.0-x86_64",
    "provider_type": "local"
  },
  "disclaimer": null
}
```

*(Note : les valeurs numériques ci-dessus sont données à titre d'exemple de structure et ne constituent pas un résultat mesuré).*

---

## 5. Procédure de Reproduction

Pour exécuter une campagne de mesure conforme au protocole :
```bash
# 1. Diagnostic préalable
python3 scripts/doctor.py

# 2. Exécution CLI
python3 scripts/benchmark_llm.py --runs 5 --warmup 2 --max-tokens 256 --json > benchmark_result.json

# 3. Vérification de l'intégrité
grep -E "is_amd_benchmark|tokens_per_second" benchmark_result.json
```
