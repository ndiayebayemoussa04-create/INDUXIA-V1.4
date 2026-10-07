import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

interface AuditLog {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  device: string;
  language: string;
  prompt_tokens: number;
  output_tokens: number;
  latency_ms: number;
  status: string;
  action_proposed?: string;
  validation_status?: 'APPROVED' | 'REJECTED' | 'PENDING' | 'N/A';
}

const auditLogs: AuditLog[] = [
  {
    id: 'AUD-8801',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    provider: 'mock',
    model: 'Qwen2.5-7B-Instruct',
    device: 'cpu',
    language: 'fr',
    prompt_tokens: 42,
    output_tokens: 146,
    latency_ms: 52.4,
    status: 'SUCCESS',
    action_proposed: 'SETPOINT_ADJUSTMENT (-25%)',
    validation_status: 'APPROVED',
  },
  {
    id: 'AUD-8802',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    provider: 'mock',
    model: 'Qwen2.5-7B-Instruct',
    device: 'cpu',
    language: 'fr',
    prompt_tokens: 38,
    output_tokens: 124,
    latency_ms: 48.9,
    status: 'SUCCESS',
    action_proposed: 'WORK_ORDER_CREATION (SOP-MNT-2024-08)',
    validation_status: 'APPROVED',
  },
];

let benchmarkHistory: any[] = [];

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Version Endpoint
  app.get('/api/version', (_req, res) => {
    res.json({
      name: 'INDUXIA',
      version: '1.4.0',
      codename: 'AMD ROCm Local AI Engine',
    });
  });

  // 2. Hardware Device & Diagnostics
  app.get('/api/system/diagnostics', (_req, res) => {
    execFile('python3', ['scripts/doctor.py'], (error, stdout, stderr) => {
      let rocmStatus = 'NOT DETECTED';
      let gpuName = 'None (CPU Execution)';
      let isAmd = false;

      if (!error && stdout) {
        if (stdout.includes('ROCm: detected')) {
          rocmStatus = 'detected';
          isAmd = true;
        }
        const gpuMatch = stdout.match(/GPU:\s*(.*)/);
        if (gpuMatch && gpuMatch[1]) {
          gpuName = gpuMatch[1].trim();
        }
      }

      res.json({
        raw_output: stdout || stderr || 'Executed doctor script',
        rocm_status: rocmStatus,
        rocm_ready: isAmd,
        gpu_name: gpuName,
        os: process.platform,
        node_version: process.version,
        timestamp: new Date().toISOString(),
      });
    });
  });

  // 3. LLM Status
  app.get('/api/llm/status', (_req, res) => {
    execFile('python3', ['-m', 'backend.llm.device'], (error, stdout) => {
      let dev = {
        device: 'cpu',
        accelerator: 'none',
        available: false,
        gpu_name: null as string | null,
        pytorch_version: null as string | null,
        hip_version: null as string | null,
      };

      if (!error && stdout) {
        try {
          dev = JSON.parse(stdout);
        } catch (e) {
          // fallback
        }
      }

      const isAmdReady = dev.device === 'amd' && dev.accelerator === 'rocm' && dev.available;

      res.json({
        provider: process.env.INDUXIA_LLM_PROVIDER || 'mock',
        model: process.env.INDUXIA_MODEL_NAME || 'Qwen2.5-7B-Instruct',
        base_url: process.env.INDUXIA_LLM_BASE_URL || 'http://localhost:11434/v1',
        device: dev.device,
        accelerator: dev.accelerator,
        gpu_name: dev.gpu_name || 'N/A (CPU Mode)',
        rocm_available: isAmdReady,
        rocm_status_label: isAmdReady ? 'ROCm READY' : 'ROCm NOT DETECTED',
        timeout: 30,
        max_tokens: 512,
        temperature: 0.2,
      });
    });
  });

  // 4. LLM Models
  app.get('/api/llm/models', (_req, res) => {
    res.json({
      active_model: process.env.INDUXIA_MODEL_NAME || 'Qwen2.5-7B-Instruct',
      models: [
        {
          id: 'Qwen2.5-7B-Instruct',
          name: 'Qwen 2.5 7B Instruct (Standard Industriel)',
          parameters: '7.6B',
          quantization: 'Int4 / AWQ / GGUF',
          vram_min: '6 GB',
          target: 'AMD ROCm (Radeon RX 7000 / Instinct) ou CPU',
          sovereign: true,
          status: 'Active',
        },
        {
          id: 'Llama-3.1-8B-Instruct',
          name: 'Meta Llama 3.1 8B Instruct',
          parameters: '8.0B',
          quantization: 'FP16 / Int8',
          vram_min: '8 GB',
          target: 'AMD ROCm Serveur',
          sovereign: true,
          status: 'Compatible',
        },
        {
          id: 'Mistral-7B-Instruct-v0.3',
          name: 'Mistral 7B Instruct v0.3',
          parameters: '7.2B',
          quantization: 'GGUF Q4_K_M',
          vram_min: '5.5 GB',
          target: 'AMD ROCm / CPU Edge',
          sovereign: true,
          status: 'Compatible',
        },
      ],
    });
  });

  // 5. LLM Generate
  app.post('/api/llm/generate', (req, res) => {
    const { prompt, language = 'fr', model, context_sources = [] } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt requis' });
    }

    if (prompt.length > 8000) {
      return res.status(400).json({ error: 'Prompt trop long (max 8000 caractères)' });
    }

    const payload = JSON.stringify({
      prompt: prompt.trim(),
      language,
      model: model || 'Qwen2.5-7B-Instruct',
      context_sources,
    });

    execFile('python3', ['-c', `
import sys, json
from backend.api.llm import handle_generate
payload = json.loads(sys.argv[1])
result = handle_generate(payload)
print(json.dumps(result))
`, payload], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          error: 'Erreur lors de la génération Python',
          details: stderr || error.message,
        });
      }

      try {
        const parsed = JSON.parse(stdout);
        // Log to audit
        const logEntry: AuditLog = {
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          provider: parsed.provider || 'mock',
          model: parsed.model || 'Qwen2.5-7B-Instruct',
          device: parsed.device || 'cpu',
          language,
          prompt_tokens: parsed.prompt_tokens || 10,
          output_tokens: parsed.completion_tokens || 50,
          latency_ms: parsed.latency_ms || 45,
          status: 'SUCCESS',
          action_proposed: parsed.proposed_actions?.length > 0
            ? `${parsed.proposed_actions[0].type} (${parsed.proposed_actions[0].proposed_value})`
            : undefined,
          validation_status: parsed.requires_human_validation ? 'PENDING' : 'N/A',
        };
        auditLogs.unshift(logEntry);
        if (auditLogs.length > 50) auditLogs.pop();

        res.json(parsed);
      } catch (e: any) {
        res.status(500).json({ error: 'Erreur de décodage JSON', raw: stdout });
      }
    });
  });

  // 6. Benchmark Run & Results
  app.post('/api/benchmark/run', (req, res) => {
    const runs = req.body.runs || 3;
    const warmup = req.body.warmup || 1;
    const maxTokens = req.body.max_tokens || 256;

    execFile(
      'python3',
      ['scripts/benchmark_llm.py', '--json', '--runs', String(runs), '--warmup', String(warmup), '--max-tokens', String(maxTokens)],
      (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({
            error: 'Échec de lexécution du benchmark',
            details: stderr || error.message,
          });
        }

        try {
          const result = JSON.parse(stdout);
          benchmarkHistory.unshift(result);
          if (benchmarkHistory.length > 20) benchmarkHistory.pop();
          res.json(result);
        } catch (e: any) {
          res.status(500).json({ error: 'Réponse JSON invalide', raw: stdout });
        }
      }
    );
  });

  app.get('/api/benchmark/results', (_req, res) => {
    res.json({
      count: benchmarkHistory.length,
      latest: benchmarkHistory[0] || null,
      history: benchmarkHistory,
    });
  });

  // 7. Machines Fleet Telemetry (V1.3 Preserved)
  app.get('/api/machines', (_req, res) => {
    res.json([
      {
        id: 'MCH-CNC-04',
        name: 'CNC Milling Unit 04',
        category: 'Usinage Grande Vitesse',
        location: 'Ligne B - Poste 4',
        status: 'WARNING',
        health_index: 73,
        spindle_speed_rpm: 11950,
        vibration_rms_mms: 5.82,
        vibration_threshold_mms: 4.5,
        bearing_temp_c: 74.2,
        bearing_temp_nominal_c: 56.0,
        active_hours: 4812,
        last_maintenance: '2026-08-14',
      },
      {
        id: 'MCH-HP-12',
        name: 'Presse Hydraulique HP-12',
        category: 'Emboutissage Châssis',
        location: 'Ligne A - Presse 2',
        status: 'NOMINAL',
        health_index: 96,
        pressure_bar: 242.0,
        pressure_nominal_bar: 240.0,
        vibration_rms_mms: 1.45,
        vibration_threshold_mms: 4.5,
        cycle_time_s: 4.18,
        active_hours: 9230,
        last_maintenance: '2026-09-20',
      },
      {
        id: 'MCH-TG-02',
        name: 'Turbine Génératrice TG-02',
        category: 'Génération Auxiliaire',
        location: 'Bâtiment Énergie',
        status: 'NOMINAL',
        health_index: 94,
        spindle_speed_rpm: 3000,
        vibration_rms_mms: 1.82,
        vibration_threshold_mms: 3.5,
        bearing_temp_c: 58.1,
        bearing_temp_nominal_c: 55.0,
        active_hours: 14210,
        last_maintenance: '2026-07-02',
      },
      {
        id: 'MCH-KUKA-R7',
        name: 'Bras Robotisé KUKA-R7',
        category: 'Soudure Haute Cadence',
        location: 'Cellule Robotique 02',
        status: 'NOMINAL',
        health_index: 98,
        axis_3_current_a: 14.1,
        repeatability_mm: 0.025,
        vibration_rms_mms: 0.85,
        vibration_threshold_mms: 2.8,
        active_hours: 3120,
        last_maintenance: '2026-09-28',
      },
    ]);
  });

  // 8. Alerts (V1.3 Preserved)
  app.get('/api/alerts', (_req, res) => {
    res.json([
      {
        id: 'ALT-1092',
        machine_id: 'MCH-CNC-04',
        machine_name: 'CNC Milling Unit 04',
        severity: 'CRITICAL',
        title: 'Dérive vibratoire anormale broche principale',
        description: 'Vibration mesurée à 5.82 mm/s RMS (Seuil ISO 10816 Zone C : 4.50 mm/s). Risque d endommagement prématuré des billes céramiques.',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        suggested_action: 'Réduire avance broche de 25% et déclencher inspection endoscopique.',
        iso_reference: 'ISO 10816-3 Classe II',
        acknowledged: false,
      },
      {
        id: 'ALT-1088',
        machine_id: 'MCH-CNC-04',
        machine_name: 'CNC Milling Unit 04',
        severity: 'WARNING',
        title: 'Élévation thermique palier arrière (+18.2°C)',
        description: 'Température palier atteignant 74.2°C (Consigne max admissible : 70°C). Dégradation progressive du film lubrifiant.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        suggested_action: 'Contrôle niveau graisse SKF LGHP 2 et purge canalisation.',
        iso_reference: 'SOP-MNT-2024-08',
        acknowledged: true,
      },
    ]);
  });

  // 9. RAG Knowledge Documents (V1.3 Preserved)
  app.get('/api/rag/documents', (_req, res) => {
    res.json([
      {
        id: 'DOC-ISO-10816',
        title: 'Norme ISO 10816-3 — Évaluation des vibrations mécaniques',
        category: 'Standards & Réglementations',
        excerpt: 'Définit les zones de sévérité vibratoire pour machines industrielles de 15 kW à 300 kW. Zone A: Nouveau matériel. Zone B: Fonctionnement illimité. Zone C: Fonctionnement temporaire avec surveillance. Zone D: Arrêt obligatoire.',
        date_updated: '2026-01-15',
        certified: true,
      },
      {
        id: 'DOC-SOP-MNT-2024',
        title: 'SOP-MNT-2024-08 — Maintenance Broches & Paliers SKF',
        category: 'Procédures Opérationnelles (SOP)',
        excerpt: 'Procédure standard pour le contrôle de précharge, le diagnostic acoustique et le regraissage sous pression des broches CNC à contact oblique avec lubrifiant SKF LGHP 2.',
        date_updated: '2026-05-10',
        certified: true,
      },
      {
        id: 'DOC-OEM-CNC04',
        title: 'Manuel Constructeur OEM — Fraiseuse CNC-04 (Rév. D)',
        category: 'Manuels Constructeurs',
        excerpt: 'Chapitre 7.4 : Limites opérationnelles admissibles. La température maximale permanente du palier arrière ne doit pas excéder 70°C en usinage continu.',
        date_updated: '2025-11-20',
        certified: true,
      },
      {
        id: 'DOC-SAFETY-LIGNEB',
        title: 'Protocole de Mise en Sécurité & Arrêt d Urgence Ligne B',
        category: 'Sécurité Industrielle',
        excerpt: 'Règles strictes de consignation énergétique. Toute modification de paramètre critique en ligne automatisée requiert la double validation du responsable d îlot.',
        date_updated: '2026-02-01',
        certified: true,
      },
    ]);
  });

  // 10. Human-In-The-Loop Action Validation
  app.post('/api/actions/validate', (req, res) => {
    const { action_id, decision, operator_name, notes } = req.body;
    if (!action_id || !decision) {
      return res.status(400).json({ error: 'action_id et decision requis' });
    }

    const logEntry = auditLogs.find((l) => l.action_proposed && l.validation_status === 'PENDING');
    if (logEntry) {
      logEntry.validation_status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    }

    res.json({
      status: 'CONFIRMED',
      action_id,
      decision,
      operator: operator_name || 'Chef d Atelier',
      timestamp: new Date().toISOString(),
      notes: notes || 'Enregistré dans le registre d audit souverain',
    });
  });

  // 11. Audit Logs
  app.get('/api/audit/logs', (_req, res) => {
    res.json(auditLogs);
  });

  // 12. Direct Download of the Official Zip Bundle
  app.get('/api/download/zip', (_req, res) => {
    const zipFilePath = path.join(process.cwd(), 'INDUXIA_v1_4_AMD_ROCM_LOCAL_AI.zip');
    if (fs.existsSync(zipFilePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="INDUXIA_v1_4_AMD_ROCM_LOCAL_AI.zip"');
      const fileStream = fs.createReadStream(zipFilePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Archive zip introuvable sur le disque.' });
    }
  });

  // Download Executive Word Document
  app.get('/api/download/docx', (_req, res) => {
    const docxPath = path.join(process.cwd(), 'documents', 'INDUXIA_Dossier_Investisseurs_et_Dirigeants.docx');
    if (fs.existsSync(docxPath)) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="INDUXIA_Dossier_Investisseurs_et_Dirigeants.docx"');
      const fileStream = fs.createReadStream(docxPath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Document Word introuvable.' });
    }
  });

  // Download Executive PowerPoint Presentation
  app.get('/api/download/pptx', (_req, res) => {
    const pptxPath = path.join(process.cwd(), 'documents', 'INDUXIA_Presentation_Investisseurs_et_Dirigeants.pptx');
    if (fs.existsSync(pptxPath)) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', 'attachment; filename="INDUXIA_Presentation_Investisseurs_et_Dirigeants.pptx"');
      const fileStream = fs.createReadStream(pptxPath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Présentation PowerPoint introuvable.' });
    }
  });

  // Download Git Bundle (Complete Git History & Commits)
  app.get('/api/download/bundle', (_req, res) => {
    const bundlePath = path.join(process.cwd(), 'induxia-v1-4.bundle');
    if (fs.existsSync(bundlePath)) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="induxia-v1-4.bundle"');
      const fileStream = fs.createReadStream(bundlePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Fichier bundle introuvable.' });
    }
  });

  // Push directly to GitHub with user token
  app.post('/api/git/push', (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'GitHub Personal Access Token requis.' });
    }
    const cleanToken = token.trim();
    const repoWithToken = `https://${cleanToken}@github.com/ndiayebayemoussa04-create/INDUXIA-V1.4.git`;

    execFile('git', ['push', repoWithToken, 'main'], (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({
          error: 'Échec du push vers GitHub. Vérifiez les permissions de votre Personal Access Token.',
          details: stderr || err.message,
        });
      }
      res.json({
        success: true,
        message: 'Dépôt poussé avec succès sur https://github.com/ndiayebayemoussa04-create/INDUXIA-V1.4 !',
        output: stdout || stderr,
      });
    });
  });

  // 13. Energy & ISO 50001 Correlation (Roadmap V1.5)
  app.get('/api/energy/telemetry', (_req, res) => {
    res.json({
      plant_total_kw: 342.8,
      nominal_plant_kw: 318.5,
      friction_loss_kw: 24.3,
      daily_waste_cost_eur: 87.5,
      co2_impact_kg_h: 11.2,
      iso_50001_status: 'CONFORME_AVEC_ÉCART',
      machines: [
        {
          id: 'MCH-CNC-04',
          current_kw: 18.4,
          nominal_kw: 14.2,
          waste_ratio: 0.296,
          cause: 'Frottement anormal palier arrière (5.82 mm/s RMS)',
        },
        {
          id: 'MCH-HP-12',
          current_kw: 112.0,
          nominal_kw: 110.5,
          waste_ratio: 0.013,
          cause: 'Nominal',
        },
        {
          id: 'MCH-TG-02',
          current_kw: 185.0,
          nominal_kw: 182.0,
          waste_ratio: 0.016,
          cause: 'Nominal',
        },
      ],
    });
  });

  // 14. Remaining Useful Life (RUL) & What-If Simulator (Roadmap V1.6)
  app.post('/api/rul/simulate', (req, res) => {
    const { machine_id = 'MCH-CNC-04', speed_reduction_pct = 0, lubrication_done = false } = req.body;

    // Baseline RUL at 100% nominal speed with anomaly: 18.5 hours
    let baseHours = 18.5;
    const speed = Math.max(0, Math.min(50, Number(speed_reduction_pct) || 0));

    // Exponential fatigue relief: (1 - speed/100)^(-2.5)
    let extendedHours = baseHours * Math.pow(1 + speed / 35, 2.2);
    if (lubrication_done) {
      extendedHours *= 1.85;
    }

    const confidenceInterval = 0.95;
    const margin = extendedHours * 0.12;

    res.json({
      machine_id,
      baseline_rul_hours: 18.5,
      simulated_rul_hours: Math.round(extendedHours * 10) / 10,
      rul_range: {
        min: Math.round((extendedHours - margin) * 10) / 10,
        max: Math.round((extendedHours + margin) * 10) / 10,
      },
      confidence_interval: confidenceInterval,
      speed_reduction_pct: speed,
      lubrication_done,
      recommendation:
        speed >= 20
          ? 'La réduction de consigne permet de terminer les commandes en cours jusqu à l arrêt programmé du week-end.'
          : 'Risque de blocage broche avant la relève de quart. Réduction de consigne minimale de 20% recommandée.',
      production_impact: {
        cycle_time_delta_pct: +(speed * 0.75).toFixed(1),
        parts_per_hour_estimate: Math.round(60 * (1 - (speed * 0.0075))),
      },
    });
  });

  // 15. Industrial Connectors Status (OPC-UA / MQTT / SAP)
  app.get('/api/connectors/status', (_req, res) => {
    res.json({
      opc_ua: {
        server_endpoint: 'opc.tcp://192.168.10.150:4840/INDUXIA-Plant',
        status: 'CONNECTED',
        monitored_nodes: 148,
        latency_ms: 3.8,
        plc_targets: ['Siemens S7-1500', 'Beckhoff CX5130'],
      },
      mqtt_sparkplug: {
        broker: 'tls://edge-broker.local:8883',
        topic_namespace: 'spBv1.0/INDUXIA_FACTORY_01',
        status: 'ACTIVE',
        msg_rate_per_sec: 42,
      },
      gmao_sap_pm: {
        endpoint: 'rfc://sap-erp.local:3300',
        system_id: 'PRD',
        status: 'SYNCHRONIZED',
        pending_work_orders: 1,
      },
    });
  });

  // Vite middleware in dev mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, HOST, () => {
    console.log(`INDUXIA V1.4 Server listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
