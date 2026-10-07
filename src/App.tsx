import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Terminal,
  Download,
  Languages,
  RotateCw,
  Play,
  Check,
  X,
  ChevronRight,
  Info,
  Gauge,
  Layers,
  Server,
  HardDrive,
  Search,
  Database,
  ShieldCheck,
  Zap,
} from 'lucide-react';

// Types
interface Machine {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  health_index: number;
  spindle_speed_rpm?: number;
  vibration_rms_mms: number;
  vibration_threshold_mms: number;
  bearing_temp_c?: number;
  bearing_temp_nominal_c?: number;
  pressure_bar?: number;
  active_hours: number;
  last_maintenance: string;
}

interface AlertItem {
  id: string;
  machine_id: string;
  machine_name: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  timestamp: string;
  suggested_action: string;
  iso_reference: string;
  acknowledged: boolean;
}

interface RAGDoc {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  date_updated: string;
  certified: boolean;
}

interface BenchmarkData {
  timestamp: string;
  is_amd_benchmark: boolean;
  hardware: {
    device: string;
    accelerator: string;
    gpu_name: string;
    rocm_version: string;
    pytorch_version: string;
    memory_total: string;
  };
  model: string;
  runs: number;
  warmup: number;
  latency_ms: {
    mean: number;
    median: number;
    p95: number;
    min: number;
    max: number;
  };
  generation: {
    total_tokens: number;
    prompt_tokens_avg: number;
    output_tokens_avg: number;
    tokens_per_second: number;
  };
  time_to_first_token_ms?: number;
  peak_gpu_memory?: string;
  disclaimer?: string;
}

interface LLMStatus {
  provider: string;
  model: string;
  base_url: string;
  device: string;
  accelerator: string;
  gpu_name: string;
  rocm_available: boolean;
  rocm_status_label: string;
}

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

export default function App() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [activeTab, setActiveTab] = useState<'overview' | 'copilot' | 'machines' | 'alerts' | 'rag' | 'audit' | 'future'>('overview');

  // State
  const [llmStatus, setLlmStatus] = useState<LLMStatus>({
    provider: 'mock',
    model: 'Qwen2.5-7B-Instruct',
    base_url: 'http://localhost:11434/v1',
    device: 'cpu',
    accelerator: 'none',
    gpu_name: 'N/A (CPU Mode)',
    rocm_available: false,
    rocm_status_label: 'ROCm NOT DETECTED',
  });

  const [machines, setMachines] = useState<Machine[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [docs, setDocs] = useState<RAGDoc[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Benchmarking & Diagnostics
  const [latestBenchmark, setLatestBenchmark] = useState<BenchmarkData | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchRuns, setBenchRuns] = useState(3);
  const [benchWarmup, setBenchWarmup] = useState(1);
  const [diagnosticsOutput, setDiagnosticsOutput] = useState<string | null>(null);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [showBenchModal, setShowBenchModal] = useState(false);

  // Future Roadmap Interactive State (V1.5 & V1.6)
  const [speedReduction, setSpeedReduction] = useState(25);
  const [lubricationDone, setLubricationDone] = useState(true);
  const [rulData, setRulData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<any>(null);
  const [connectorsData, setConnectorsData] = useState<any>(null);

  // Copilot State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<any>(null);
  const [validationModalAction, setValidationModalAction] = useState<any>(null);
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);

  // Load initial system data
  useEffect(() => {
    fetchLLMStatus();
    fetchMachines();
    fetchAlerts();
    fetchDocs();
    fetchAuditLogs();
    fetchBenchmarkHistory();
    fetchEnergyData();
    fetchConnectorsData();
    simulateRUL(25, true);
  }, []);

  const fetchEnergyData = async () => {
    try {
      const res = await fetch('/api/energy/telemetry');
      if (res.ok) setEnergyData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConnectorsData = async () => {
    try {
      const res = await fetch('/api/connectors/status');
      if (res.ok) setConnectorsData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const simulateRUL = async (speedPct: number, lubDone: boolean) => {
    try {
      const res = await fetch('/api/rul/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: 'MCH-CNC-04',
          speed_reduction_pct: speedPct,
          lubrication_done: lubDone,
        }),
      });
      if (res.ok) setRulData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLLMStatus = async () => {
    try {
      const res = await fetch('/api/llm/status');
      if (res.ok) {
        const data = await res.json();
        setLlmStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await fetch('/api/machines');
      if (res.ok) setMachines(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) setAlerts(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/rag/documents');
      if (res.ok) setDocs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit/logs');
      if (res.ok) setAuditLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBenchmarkHistory = async () => {
    try {
      const res = await fetch('/api/benchmark/results');
      if (res.ok) {
        const data = await res.json();
        if (data.latest) setLatestBenchmark(data.latest);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runDiagnostics = async () => {
    setShowDiagModal(true);
    setDiagnosticsOutput('Exécution de python scripts/doctor.py en cours...');
    try {
      const res = await fetch('/api/system/diagnostics');
      const data = await res.json();
      setDiagnosticsOutput(data.raw_output);
    } catch (e: any) {
      setDiagnosticsOutput(`Erreur lors de l'exécution du diagnostic: ${e.message}`);
    }
  };

  const executeBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runs: benchRuns, warmup: benchWarmup, max_tokens: 256 }),
      });
      const data = await res.json();
      setLatestBenchmark(data);
      fetchAuditLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const askCopilot = async (customPrompt?: string) => {
    const query = customPrompt || copilotInput;
    if (!query.trim()) return;

    setCopilotLoading(true);
    setCopilotResponse(null);
    setValidationFeedback(null);

    try {
      const res = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          language: lang,
          model: llmStatus.model,
          context_sources: docs,
        }),
      });
      const data = await res.json();
      setCopilotResponse(data);
      fetchAuditLogs();
    } catch (e: any) {
      setCopilotResponse({
        text: `[Erreur] ${e.message}`,
        sources_used: [],
        requires_human_validation: false,
      });
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleValidateAction = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!validationModalAction) return;
    try {
      const res = await fetch('/api/actions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: validationModalAction.action_id || 'ACT-701',
          decision,
          operator_name: 'Superviseur Ligne B (Jean Dupont)',
        }),
      });
      if (res.ok) {
        setValidationFeedback(
          decision === 'APPROVED'
            ? lang === 'fr'
              ? 'Consigne approuvée et transmise à l automate en mode sécurisé.'
              : 'Setpoint approved and transmitted to PLC in secured mode.'
            : lang === 'fr'
              ? 'Action rejetée. La machine maintient sa consigne nominale.'
              : 'Action rejected. Machine remains on nominal setpoint.'
        );
        setValidationModalAction(null);
        fetchAuditLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. TOP BAR CONTRACT */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Zone: Single element */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center font-bold text-white shadow-sm shadow-rose-900/30">
              IN
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-white hover:text-rose-400 transition-colors">
              INDUXIA V1.4
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'overview', label: lang === 'fr' ? 'Supervision' : 'Overview' },
              { id: 'copilot', label: 'Copilote IA' },
              { id: 'machines', label: lang === 'fr' ? 'Parc Machines' : 'Machines' },
              { id: 'alerts', label: lang === 'fr' ? 'Alertes' : 'Alerts' },
              { id: 'rag', label: 'RAG Doc' },
              { id: 'audit', label: lang === 'fr' ? 'Gouvernance' : 'Audit Trail' },
              { id: 'future', label: lang === 'fr' ? 'Usine du Futur' : 'Future Industry' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-rose-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Action Zone */}
          <div className="flex items-center gap-2.5">
            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-slate-700 bg-slate-800/60 hover:bg-slate-800 rounded text-slate-300 transition-colors"
              title="Changer de langue"
            >
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono uppercase">{lang}</span>
            </button>

            {/* Word Dossier Download Button */}
            <a
              href="/api/download/docx"
              download="INDUXIA_Dossier_Investisseurs_et_Dirigeants.docx"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Télécharger le Dossier Investisseurs au format Word"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Word (.docx)</span>
            </a>

            {/* PowerPoint Pitch Deck Download Button */}
            <a
              href="/api/download/pptx"
              download="INDUXIA_Presentation_Investisseurs_et_Dirigeants.pptx"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-rose-900/60 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 transition-colors"
              title="Télécharger la Présentation Pitch Deck au format PowerPoint"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>PPT (.pptx)</span>
            </a>

            {/* ZIP Download Button */}
            <a
              href="/api/download/zip"
              download="INDUXIA_v1_4_AMD_ROCM_LOCAL_AI.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm shadow-rose-900/40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Livrable ZIP' : 'Download ZIP'}</span>
            </a>
          </div>
        </div>
      </header>

      {/* SUB-HEADER STATUS BAR */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Usine Numérique 01 — Ligne B</span>
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Version 1.4.0 (AMD ROCm Sovereign Edition)</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>IA Locale Déconnectée (Zéro Cloud Requis)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'fr' ? 'Diagnostic Système' : 'System Doctor'}</span>
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => setShowBenchModal(true)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Gauge className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'fr' ? 'Benchmark Matériel' : 'Hardware Benchmark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* SECTION 12: AMD AI ENGINE HERO CARD */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">Moteur d Inférence Dédié</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Section 12 V1.4</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                AMD AI ENGINE
              </h2>
            </div>

            {/* Visual State: ROCm READY vs ROCm NOT DETECTED */}
            <div className="flex items-center gap-3">
              {llmStatus.rocm_available ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-800 bg-emerald-950/60 text-emerald-300 text-xs font-semibold font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ROCm READY</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-amber-900/70 bg-amber-950/40 text-amber-300 text-xs font-semibold font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>ROCm NOT DETECTED</span>
                </div>
              )}

              <button
                onClick={() => setShowBenchModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Benchmark</span>
              </button>

              <button
                onClick={runDiagnostics}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>System Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Engine Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">LLM Provider</p>
              <p className="text-white font-mono font-semibold mt-1 uppercase">{llmStatus.provider}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">OpenAI / Native</p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Modèle Actif</p>
              <p className="text-white font-mono font-semibold mt-1 truncate" title={llmStatus.model}>
                {llmStatus.model}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">Contexte 8192 tok</p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Cible Matérielle</p>
              <p className="text-white font-mono font-semibold mt-1 uppercase">
                {llmStatus.device} / {llmStatus.accelerator}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {llmStatus.rocm_available ? 'AMD HIP Accéléré' : 'Repli CPU Résilient'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">GPU Détecté / VRAM</p>
              <p className="text-white font-mono font-semibold mt-1 truncate" title={llmStatus.gpu_name}>
                {llmStatus.gpu_name}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {latestBenchmark?.hardware.memory_total || 'N/A (CPU)'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Latence Médiane</p>
              <p className="text-white font-mono font-semibold mt-1">
                {latestBenchmark ? `${latestBenchmark.latency_ms.median} ms` : 'Non mesurée'}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {latestBenchmark ? `p95: ${latestBenchmark.latency_ms.p95} ms` : 'Exécuter benchmark'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Débit Inférence</p>
              <p className="text-white font-mono font-semibold mt-1">
                {latestBenchmark ? `${latestBenchmark.generation.tokens_per_second} tok/s` : 'Non mesuré'}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {latestBenchmark?.is_amd_benchmark ? 'Certifié AMD' : 'Baseline CPU'}
              </p>
            </div>
          </div>
        </section>

        {/* TAB 1: OVERVIEW & INDUSTRIAL DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>TRS Global Usine (OEE)</span>
                  <Gauge className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">88.4%</span>
                  <span className="text-xs text-emerald-400">+1.2% nominal</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">4 équipements en surveillance active</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Alertes Détectées</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-amber-300">2 Actives</span>
                  <span className="text-xs text-amber-400">1 Critique / 1 Avert.</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Dérive palier broche CNC-04</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Disponibilité RAG Souverain</span>
                  <Database className="w-4 h-4 text-rose-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">100% Local</span>
                  <span className="text-xs text-rose-400">4 docs certifiés</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">ISO 10816-3 & Procédures OEM</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Contrat Human-In-The-Loop</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">Strict</span>
                  <span className="text-xs text-indigo-400">Observe + Propose</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Zéro exécution automatique non validée</p>
              </div>
            </div>

            {/* TWO-COLUMN LAYOUT: CRITICAL ANOMALY FOCUS & LIVE COPILOT PROMPT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Anomaly Spotlight */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-red-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span>ALERTE CRITIQUE VIBRATOIRE (CNC-04)</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">ALT-1092 · ISO 10816 Zone C</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-semibold text-white">
                      Dérive vibratoire mesurée à 5.82 mm/s RMS sur le palier arrière de la broche principale.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Seuil de tolérance nominal ISO 10816-3 Classe II : 4.50 mm/s. La température palier atteint 74.2°C (baseline nominale : 56°C). Risque de rupture sous 18 heures sans action corrective.
                    </p>

                    <div className="bg-slate-950 border border-slate-800/80 rounded p-3 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Broche RPM :</span>
                        <span className="text-slate-200">11,950 tr/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vibration RMS :</span>
                        <span className="text-red-400 font-bold">5.82 mm/s (Zone C)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Température Palier :</span>
                        <span className="text-amber-400 font-bold">74.2 °C (+18.2 °C)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Scénario Hackathon Démo</span>
                  <button
                    onClick={() => {
                      setActiveTab('copilot');
                      setCopilotInput(
                        lang === 'fr'
                          ? 'Quelle est la cause probable de l anomalie vibratoire sur CNC-04 et quelle procédure de maintenance dois-je suivre ?'
                          : 'What is the probable cause of the vibration anomaly on CNC-04 and which maintenance procedure should I follow?'
                      );
                      askCopilot(
                        lang === 'fr'
                          ? 'Quelle est la cause probable de l anomalie vibratoire sur CNC-04 et quelle procédure de maintenance dois-je suivre ?'
                          : 'What is the probable cause of the vibration anomaly on CNC-04 and which maintenance procedure should I follow?'
                      );
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                  >
                    <span>{lang === 'fr' ? 'Demander au Copilote' : 'Ask Industrial Copilot'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* RAG & Sovereign Local Architecture */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Chaine de Résilience & RAG Local
                    </h3>
                    <span className="text-xs font-mono text-emerald-400">Zero Cloud Egress</span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs text-slate-300">
                    <p className="leading-relaxed">
                      INDUXIA V1.4 intègre un RAG local prioritaire. L analyse ne repose sur aucune API externe opaque : les données télémétriques de l usine sont croisées localement avec les manuels constructeurs et les normes de sécurité.
                    </p>

                    <div className="space-y-2 pt-2">
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-200">ISO 10816-3 (Classe II)</p>
                          <p className="text-slate-400 text-[11px]">Définition des zones de sévérité vibratoire pour moteurs et broches industrielles.</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-200">SOP-MNT-2024-08</p>
                          <p className="text-slate-400 text-[11px]">Protocole de regraissage sous pression broche CNC avec graisse SKF LGHP 2.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Intégrité des données garantie sur site</span>
                  <button
                    onClick={() => setActiveTab('rag')}
                    className="text-rose-400 hover:text-rose-300 font-medium"
                  >
                    {lang === 'fr' ? 'Consulter la base RAG →' : 'Explore RAG KB →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INDUSTRIAL COPILOT */}
        {activeTab === 'copilot' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {lang === 'fr' ? 'Copilote Industriel Souverain' : 'Sovereign Industrial Copilot'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Protocole strict: OBSERVATION · INFERENCE · DOCUMENTATION · RECOMMANDATION
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Mode :</span>
                  <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-rose-400 font-semibold">
                    OBSERVE + PROPOSE
                  </span>
                </div>
              </div>

              {/* Quick Prompt Presets */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Requêtes rapides :</span>
                <button
                  onClick={() => {
                    const q = lang === 'fr'
                      ? 'Quelle est la cause probable de l anomalie vibratoire sur CNC-04 et quelle procédure de maintenance dois-je suivre ?'
                      : 'What is the probable cause of the vibration anomaly on CNC-04 and which maintenance procedure should I follow?';
                    setCopilotInput(q);
                    askCopilot(q);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 transition-colors"
                >
                  {lang === 'fr' ? '⚡ Démo Hackathon : Anomalie CNC-04' : '⚡ Hackathon Demo: CNC-04 Anomaly'}
                </button>
                <button
                  onClick={() => {
                    const q = lang === 'fr'
                      ? 'Quelle est la tolérance de vibration limite selon ISO 10816 ?'
                      : 'What is the vibration limit tolerance according to ISO 10816?';
                    setCopilotInput(q);
                    askCopilot(q);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 transition-colors"
                >
                  {lang === 'fr' ? 'Tolérance ISO 10816' : 'ISO 10816 Tolerance'}
                </button>
                <button
                  onClick={() => {
                    const q = lang === 'fr'
                      ? 'Donne moi une recette de cuisine pour le repas de midi'
                      : 'Give me a cooking recipe for lunch';
                    setCopilotInput(q);
                    askCopilot(q);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 transition-colors"
                  title="Test de la protection anti-hallucination"
                >
                  {lang === 'fr' ? '🛡️ Test Anti-Hallucination (Hors domaine)' : '🛡️ Anti-Hallucination Guard Test'}
                </button>
              </div>

              {/* Prompt Input Form */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askCopilot()}
                  placeholder={
                    lang === 'fr'
                      ? 'Interroger le Copilote (ex: analyser la dérive thermique du palier broche)...'
                      : 'Query Copilot (e.g. analyze spindle bearing thermal drift)...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => askCopilot()}
                  disabled={copilotLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs rounded transition-colors flex items-center gap-1.5"
                >
                  {copilotLoading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'fr' ? 'Inférence...' : 'Inferring...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Analyser' : 'Analyze'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback Alert if human validation completed */}
              {validationFeedback && (
                <div className="mt-4 p-3 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{validationFeedback}</span>
                </div>
              )}

              {/* Copilot Response Card */}
              {copilotResponse && (
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-rose-400">RÉPONSE DU MODÈLE LOCAL</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{copilotResponse.model}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{copilotResponse.latency_ms} ms</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Confiance :</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {(copilotResponse.confidence_level * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Formatted Text Output */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {copilotResponse.text}
                  </div>

                  {/* Sources Grounding */}
                  {copilotResponse.sources_used && copilotResponse.sources_used.length > 0 && (
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded text-xs space-y-2">
                      <p className="text-slate-400 font-medium">Sources industrielles vérifiées :</p>
                      <ul className="space-y-1">
                        {copilotResponse.sources_used.map((s: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* HUMAN-IN-THE-LOOP PROPOSED ACTION CARD */}
                  {copilotResponse.requires_human_validation && copilotResponse.proposed_actions?.length > 0 && (
                    <div className="p-4 bg-rose-950/20 border border-rose-900/60 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>VALIDATION HUMAINE REQUISE — SECTION 14</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">Niveau de contrôle : SUPERVISEUR</span>
                      </div>

                      <p className="text-xs text-slate-300">
                        Le LLM a formulé une proposition d action industrielle. En vertu des règles de sécurité INDUXIA, le modèle ne peut en aucun cas modifier directement les consignes machines.
                      </p>

                      <div className="space-y-2">
                        {copilotResponse.proposed_actions.map((act: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="font-mono text-rose-400 font-bold">{act.type}</span>
                              <span className="text-slate-400 ml-2">Cible : {act.target}</span>
                              <p className="text-slate-300 mt-0.5">Valeur proposée : <span className="font-semibold text-white">{act.proposed_value}</span></p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setValidationModalAction(act)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-xs transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{lang === 'fr' ? 'Valider la Consigne' : 'Review & Approve'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MACHINES FLEET TELEMETRY */}
        {activeTab === 'machines' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {lang === 'fr' ? 'Parc Machines & Télémétrie en Direct' : 'Machine Fleet & Live Telemetry'}
                </h3>
                <p className="text-xs text-slate-400">
                  Surveillance vibratoire et thermique continue selon ISO 10816
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">4 Unités Monitorées</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machines.map((m) => (
                <div
                  key={m.id}
                  className={`bg-slate-900 border rounded-lg p-4 space-y-3 ${
                    m.status === 'WARNING'
                      ? 'border-amber-700/60'
                      : m.status === 'CRITICAL'
                      ? 'border-rose-700/60'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.name}</h4>
                      <p className="text-xs text-slate-400">{m.category} · {m.location}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        m.status === 'WARNING'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : m.status === 'CRITICAL'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                    <div>
                      <p className="text-slate-500">Santé (Index)</p>
                      <p className="text-white font-bold mt-0.5">{m.health_index} / 100</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Vibration RMS</p>
                      <p className={`font-bold mt-0.5 ${m.vibration_rms_mms > m.vibration_threshold_mms ? 'text-amber-400' : 'text-slate-200'}`}>
                        {m.vibration_rms_mms} mm/s
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Temp. Palier</p>
                      <p className={`font-bold mt-0.5 ${m.bearing_temp_c && m.bearing_temp_c > 65 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {m.bearing_temp_c ? `${m.bearing_temp_c} °C` : `${m.pressure_bar || 0} bar`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Heures de service : {m.active_hours}h</span>
                    <button
                      onClick={() => {
                        setActiveTab('copilot');
                        setCopilotInput(`Analyser l état opérationnel de la machine ${m.name}`);
                        askCopilot(`Analyser l état opérationnel de la machine ${m.name}`);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Diagnostiquer →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {lang === 'fr' ? 'Registre des Alertes & Anomalies' : 'Active Industrial Alerts'}
                </h3>
                <p className="text-xs text-slate-400">
                  Détection prédictive vibratoire et thermique avec traçabilité ISO
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`bg-slate-900 border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    alt.severity === 'CRITICAL' ? 'border-rose-800' : 'border-amber-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        alt.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="font-semibold text-white text-sm">{alt.title}</span>
                      <span className="text-xs text-slate-500 font-mono">({alt.machine_name})</span>
                    </div>
                    <p className="text-xs text-slate-300">{alt.description}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Référence : {alt.iso_reference} · Action suggérée : {alt.suggested_action}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('copilot');
                        setCopilotInput(`Quelle procédure suivre pour l alerte ${alt.id} sur ${alt.machine_name} ?`);
                        askCopilot(`Quelle procédure suivre pour l alerte ${alt.id} sur ${alt.machine_name} ?`);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors"
                    >
                      Résoudre avec Copilote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RAG KNOWLEDGE BASE */}
        {activeTab === 'rag' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {lang === 'fr' ? 'Base Documentaire Locale RAG' : 'Local RAG Knowledge Base'}
                </h3>
                <p className="text-xs text-slate-400">
                  Documents industriels certifiés stockés sur site sans transfert cloud
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-rose-400">{doc.category}</span>
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Certifié
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{doc.excerpt}</p>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    Dernière révision : {doc.date_updated} · RAG Vector Embedding Local
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL & GOVERNANCE */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {lang === 'fr' ? 'Registre d Audit & Traçabilité IA' : 'AI Governance & Audit Trail'}
                </h3>
                <p className="text-xs text-slate-400">
                  Journalisation immuable de chaque inférence, latence et décision humaine
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="p-3">ID Log</th>
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Modèle / Provider</th>
                    <th className="p-3">Cible Matériel</th>
                    <th className="p-3">Tokens (In/Out)</th>
                    <th className="p-3">Latence</th>
                    <th className="p-3">Action Proposée</th>
                    <th className="p-3">Validation Humaine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-rose-400">{log.id}</td>
                      <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3 text-slate-200">{log.model} ({log.provider})</td>
                      <td className="p-3 uppercase text-slate-300">{log.device}</td>
                      <td className="p-3 text-slate-400">{log.prompt_tokens} / {log.output_tokens}</td>
                      <td className="p-3 text-slate-300">{log.latency_ms} ms</td>
                      <td className="p-3 text-slate-300">{log.action_proposed || 'Consultation pure'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          log.validation_status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.validation_status === 'REJECTED'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : log.validation_status === 'PENDING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {log.validation_status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: USINE DU FUTUR (ROADMAP V1.5 -> V2.0) */}
        {activeTab === 'future' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">Roadmap & Vision Stratégique</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-mono">INDUXIA V1.5 → V2.0</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                    {lang === 'fr' ? 'Usine du Futur : Pronostic RUL, Éco-Énergie & Connectivité OT' : 'Future Factory: RUL Prognosis, Eco-Energy & OT Connectivity'}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded font-mono font-bold">
                    ROI Estimé : +520k€ à 890k€ / an
                  </span>
                </div>
              </div>

              {/* EXECUTIVE DOWNLOADS CALLOUT FOR INVESTORS & DIRECTORS */}
              <div className="mt-5 p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-rose-900/60 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {lang === 'fr' ? 'Dossiers Exécutifs Prêts pour Investisseurs & Dirigeants' : 'Executive Investor & C-Level Presentation Packages'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {lang === 'fr'
                          ? 'Présentation complète 14 slides (PowerPoint avec courbes natives) et Mémo Stratégique (Word complet avec tableaux financiers et analyse ROI).'
                          : 'Complete 14-slide pitch deck (PowerPoint with native curves) and Strategic Memo (Word document with financial tables & ROI analysis).'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="/api/download/pptx"
                      download="INDUXIA_Presentation_Investisseurs_et_Dirigeants.pptx"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Présentation PPTX (14 slides)' : 'Download PPTX (14 slides)'}</span>
                    </a>
                    <a
                      href="/api/download/docx"
                      download="INDUXIA_Dossier_Investisseurs_et_Dirigeants.docx"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>{lang === 'fr' ? 'Dossier Word DOCX' : 'Download Word DOCX'}</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <div>• Format : <span className="text-slate-200">16:9 HD & A4 Corporate</span></div>
                  <div>• Courbes : <span className="text-emerald-400">RUL & Conso Frottements</span></div>
                  <div>• Tableaux : <span className="text-rose-400">ROI 690k€ & P&L ARR</span></div>
                  <div>• Ask : <span className="text-amber-400">2,5 M€ Série A</span></div>
                </div>
              </div>

              {/* INTERACTIVE MODULE 1: RUL & WHAT-IF SIMULATOR */}
              <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-400" />
                    <h4 className="font-bold text-white text-sm">
                      {lang === 'fr' ? '1. Simulateur d Arbitrage RUL (« What-If » — V1.6)' : '1. RUL Arbitrage Simulator ("What-If" — V1.6)'}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Équipement cible : CNC Milling Unit 04</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Permet au chef d atelier de simuler l impact d un allègement de consigne sur la <strong>durée de vie résiduelle (RUL)</strong> de la broche défaillante, pour éviter un arrêt de quart non planifié.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3 bg-slate-900/80 border border-slate-800 p-3 rounded">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">Réduction de vitesse broche :</span>
                        <span className="text-rose-400 font-bold">-{speedReduction}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={speedReduction}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setSpeedReduction(v);
                          simulateRUL(v, lubricationDone);
                        }}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0% (Plein régime)</span>
                        <span>-25% (Recommandé)</span>
                        <span>-50% (Ralenti)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="checkbox"
                        id="lubCheck"
                        checked={lubricationDone}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setLubricationDone(checked);
                          simulateRUL(speedReduction, checked);
                        }}
                        className="rounded border-slate-700 accent-rose-500"
                      />
                      <label htmlFor="lubCheck" className="text-xs text-slate-300 cursor-pointer">
                        Regraissage sous pression SKF LGHP 2 appliqué (SOP-MNT-2024-08)
                      </label>
                    </div>
                  </div>

                  {/* Simulator Output Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                      <p className="text-slate-500 text-[11px]">RUL à 100% (Baseline)</p>
                      <p className="text-xl font-bold text-red-400 mt-1">18.5 h</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Casse quart de nuit</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                      <p className="text-slate-500 text-[11px]">RUL Projeté (Simulé)</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">
                        {rulData?.simulated_rul_hours || '46.8'} h
                      </p>
                      <p className="text-[10px] text-emerald-500 mt-0.5">
                        Range: {rulData?.rul_range?.min}h - {rulData?.rul_range?.max}h
                      </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded col-span-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Cadence de production :</span>
                        <span className="text-white font-bold">{rulData?.production_impact?.parts_per_hour_estimate || 50} pièces/heure</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                        Verdict : <span className="text-rose-300">{rulData?.recommendation || 'Scénario valide pour atteindre le créneau de maintenance du samedi.'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE MODULE 2: ENERGY & ISO 50001 TELEMETRY */}
              <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-sm">
                      {lang === 'fr' ? '2. Corrélation Énergétique & Décarbonation (ISO 50001 — V1.5)' : '2. Energy Correlation & Decarbonization (ISO 50001 — V1.5)'}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">CSRD Ready</span>
                </div>

                <p className="text-xs text-slate-300">
                  Détection automatique de la surconsommation électrique induite par les frottements mécaniques des roulements dégradés.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-mono">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                    <p className="text-slate-500">Puissance Globale Usine</p>
                    <p className="text-lg font-bold text-white mt-1">{energyData?.plant_total_kw || 342.8} kW</p>
                    <p className="text-[10px] text-slate-500">Nominal: {energyData?.nominal_plant_kw || 318.5} kW</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                    <p className="text-slate-500">Pertes par Frottement</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">+{energyData?.friction_loss_kw || 24.3} kW</p>
                    <p className="text-[10px] text-amber-500/80">Dérive mécanique</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                    <p className="text-slate-500">Surcoût Électrique</p>
                    <p className="text-lg font-bold text-rose-400 mt-1">{energyData?.daily_waste_cost_eur || 87.5} € / jour</p>
                    <p className="text-[10px] text-slate-500">Tarif base 0.15€/kWh</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                    <p className="text-slate-500">Empreinte CO₂ Induite</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">{energyData?.co2_impact_kg_h || 11.2} kg/h</p>
                    <p className="text-[10px] text-slate-500">Scope 2 Électrique</p>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE MODULE 3: BUS CONNECTIVITY (OPC-UA / MQTT / SAP) */}
              <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-white text-sm">
                      {lang === 'fr' ? '3. Passerelles Industrielles OT & GMAO (V1.5 & V1.6)' : '3. Industrial OT Gateways & CMMS (V1.5 & V1.6)'}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-indigo-400">Zero Cloud Egress</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs font-mono">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">OPC-UA Server</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">CONNECTED</span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate">{connectorsData?.opc_ua?.server_endpoint || 'opc.tcp://192.168.10.150:4840'}</p>
                    <p className="text-slate-500 text-[10px]">148 nœuds monitorés · Latence 3.8ms</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">MQTT Sparkplug B</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">ACTIVE</span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate">{connectorsData?.mqtt_sparkplug?.topic_namespace || 'spBv1.0/INDUXIA_FACTORY_01'}</p>
                    <p className="text-slate-500 text-[10px]">42 messages/sec compressés</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">GMAO SAP PM</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px]">SYNC</span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate">SAP PRD · Réservation SKF LGHP 2</p>
                    <p className="text-slate-500 text-[10px]">1 ordre de travail préventif synchronisé</p>
                  </div>
                </div>
              </div>

              {/* ROADMAP PHASES CARDS */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <span className="text-[11px] font-mono font-bold text-rose-400 uppercase">Phase 1 · V1.5 (3-6 mois)</span>
                  <h5 className="font-bold text-white text-sm">Connectivité OT & Éco-Énergie</h5>
                  <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                    <li>Connecteurs natifs Siemens, Schneider, Beckhoff.</li>
                    <li>Corrélation vibration / kWh (ISO 50001).</li>
                    <li>Déploiement usine Brownfield en &lt; 48 heures.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">Phase 2 · V1.6 (6-12 mois)</span>
                  <h5 className="font-bold text-white text-sm">Pronostic RUL & Boucle GMAO</h5>
                  <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                    <li>Durée de vie résiduelle avec modèles de fatigue.</li>
                    <li>Simulateur What-If pour chef d atelier.</li>
                    <li>Réservation automatique de pièces dans SAP PM.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">Phase 3 · V2.0 (12-18 mois)</span>
                  <h5 className="font-bold text-white text-sm">IA Multimodale & Opérateur Augmenté</h5>
                  <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                    <li>Caméras thermiques FLIR analysées sur ROCm.</li>
                    <li>Compagnon vocal Whisper en atelier bruyant.</li>
                    <li>Cybersécurité réseau OT conforme NIS 2 / IEC 62443.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>INDUXIA V1.4 — Industrial AI & Resilience Platform · AMD ROCm Sovereign Local Engine</p>
        <p className="font-mono text-slate-400">
          ROCm implementation prepared. Real AMD validation pending on compatible AMD hardware.
        </p>
      </footer>

      {/* MODAL 1: SYSTEM DIAGNOSTICS (DOCTOR) */}
      {showDiagModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white text-sm">INDUXIA System Diagnostics (Doctor CLI)</h3>
              </div>
              <button
                onClick={() => setShowDiagModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded p-4 font-mono text-xs text-slate-200 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {diagnosticsOutput || 'Initialisation...'}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={runDiagnostics}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
              >
                Relancer Doctor
              </button>
              <button
                onClick={() => setShowDiagModal(false)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BENCHMARK RUNNER */}
      {showBenchModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white text-sm">Benchmark Matériel Reproductible</h3>
              </div>
              <button
                onClick={() => setShowBenchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 space-y-3">
              <p>
                Ce benchmark exécute le script officiel <code className="text-rose-300 font-mono">scripts/benchmark_llm.py</code>. Conformément au protocole V1.4, aucun résultat n est falsifié.
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded font-mono">
                <div>
                  <label className="text-slate-500 block mb-1">Passes mesurées :</label>
                  <select
                    value={benchRuns}
                    onChange={(e) => setBenchRuns(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full"
                  >
                    <option value={3}>3 passes</option>
                    <option value={5}>5 passes (Standard)</option>
                    <option value={10}>10 passes (Approfondi)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Passes de chauffe (Warmup) :</label>
                  <select
                    value={benchWarmup}
                    onChange={(e) => setBenchWarmup(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full"
                  >
                    <option value={1}>1 warmup</option>
                    <option value={2}>2 warmups (Standard)</option>
                  </select>
                </div>
              </div>

              {latestBenchmark && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Statut AMD :</span>
                    <span className={latestBenchmark.is_amd_benchmark ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {latestBenchmark.is_amd_benchmark ? 'Certifié AMD ROCm' : 'Non AMD (Baseline CPU)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Médiane :</span>
                    <span className="font-bold text-white">{latestBenchmark.latency_ms.median} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Percentile 95 (p95) :</span>
                    <span>{latestBenchmark.latency_ms.p95} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Débit mesuré :</span>
                    <span className="font-bold text-emerald-400">{latestBenchmark.generation.tokens_per_second} tok/s</span>
                  </div>
                  {latestBenchmark.disclaimer && (
                    <p className="text-amber-400/80 pt-1 border-t border-slate-800 text-[10px]">
                      * {latestBenchmark.disclaimer}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={executeBenchmark}
                disabled={isBenchmarking}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {isBenchmarking ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mesure en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Lancer le Benchmark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: HUMAN-IN-THE-LOOP APPROVAL */}
      {validationModalAction && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-white text-sm">Validation Humaine Requise (Contrat V1.4)</h3>
              </div>
              <button
                onClick={() => setValidationModalAction(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Confirmez-vous l application de l action suivante sur l équipement industriel ?
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5 font-mono">
                <p className="text-slate-400">Type : <span className="text-rose-400 font-bold">{validationModalAction.type}</span></p>
                <p className="text-slate-400">Cible : <span className="text-white">{validationModalAction.target}</span></p>
                <p className="text-slate-400">Paramètre : <span className="text-white">{validationModalAction.parameter}</span></p>
                <p className="text-slate-400">Valeur : <span className="text-emerald-400 font-bold">{validationModalAction.proposed_value}</span></p>
              </div>

              <p className="text-slate-400 text-[11px]">
                En validant, l ordre est transmis à l automate via protocole sécurisé. En rejetant, la consigne reste inchangée.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleValidateAction('REJECTED')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
              >
                Rejeter l Action
              </button>
              <button
                onClick={() => handleValidateAction('APPROVED')}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approuver & Appliquer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
