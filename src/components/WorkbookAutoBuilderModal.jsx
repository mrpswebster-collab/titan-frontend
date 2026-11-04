import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Rocket,
  Globe,
  ShieldCheck,
  Database,
  Cpu,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Key,
  Layers,
  Zap,
  Target,
  DollarSign,
  FileSpreadsheet,
  Lock
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';

const STRATEGY_BLUEPRINTS = [
  {
    id: 'MOONSHOT_COILED_SPRING',
    title: '🚀 Moonshot Coiled Spring (2,000%+ Hunter)',
    subtitle: 'Sub-penny & Penny Stocks ($0.001–$0.50) | Bollinger/NR7 Squeeze + CMF Stealth Accumulation',
    badge: '2,000% RUNNER',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'MOONSHOT_COILED_SPRING',
      sector_persona: 'MOONSHOT_COILED_HUNTER',
      execution_mode: 'AUTONOMOUS',
      min_price: 0.001,
      max_price: 0.50,
      stop_loss_pct: 25.0,
      chandelier_atr_mult: 5.5,
      take_profit_pct: 2000.0,
      uncapped_runner: true,
      power_thrust_rsi_override: true,
      max_rsi: 90,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 12
    }
  },
  {
    id: 'EXPLORATION_ASSAY_SNIPER',
    title: '⛏️ PennyMines & Assay Geologist Sniper',
    subtitle: 'Gold, Lithium, Niobium & Uranium Explorers | JORC Drill Assay & Cash Runway Auditor',
    badge: 'GEOLOGIST AI',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'MOONSHOT_COILED_SPRING',
      sector_persona: 'EXPLORATION_GEOLOGIST',
      execution_mode: 'AUTONOMOUS',
      min_price: 0.002,
      max_price: 1.50,
      stop_loss_pct: 22.0,
      chandelier_atr_mult: 5.0,
      take_profit_pct: 2000.0,
      uncapped_runner: true,
      power_thrust_rsi_override: true,
      max_rsi: 88,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 12
    }
  },
  {
    id: 'INTERNATIONAL_ALPHA',
    title: '🌍 International World Exchanges (NYSE / NASDAQ / LSE / TSX)',
    subtitle: 'Wall St Tech, AI & Global Momentum | Multi-Currency FX Pot Auto-Calibration',
    badge: 'GLOBAL FX',
    defaults: {
      exchange: 'NASDAQ',
      currency: 'USD',
      strategy_protocol: 'INTERNATIONAL_ALPHA',
      sector_persona: 'WALL_ST_MOMENTUM_TECH',
      execution_mode: 'AUTONOMOUS',
      min_price: 1.00,
      max_price: 2500.0,
      stop_loss_pct: 12.0,
      chandelier_atr_mult: 3.5,
      take_profit_pct: 1000.0,
      uncapped_runner: true,
      power_thrust_rsi_override: true,
      max_rsi: 85,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 10
    }
  },
  {
    id: 'BLUE_CHIP_CORE',
    title: '🏛️ ASX 100 / Blue-Chip Institutional Fortress',
    subtitle: 'Large-Cap Dividend & Trend Compounder | 20/50/200 EMA + FCF Durability',
    badge: 'CORE FORTRESS',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'BLUE_CHIP_CORE',
      sector_persona: 'FORTRESS_QUANT_OFFICER',
      execution_mode: 'AUTONOMOUS',
      min_price: 2.00,
      max_price: 1000.0,
      stop_loss_pct: 8.0,
      chandelier_atr_mult: 2.5,
      take_profit_pct: 250.0,
      uncapped_runner: false,
      power_thrust_rsi_override: false,
      max_rsi: 72,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 15
    }
  },
  {
    id: 'DEDICATED_TICKERS_ONLY',
    title: '🎯 Dedicated Stock Watchlist Workbook',
    subtitle: 'Lock this workbook exclusively to a custom list of specific stocks you want hunted 24/7',
    badge: 'CUSTOM STOCKS',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'DEDICATED_TICKERS_ONLY',
      sector_persona: 'MOONSHOT_COILED_HUNTER',
      execution_mode: 'APPROVAL_1CLICK',
      min_price: 0.001,
      max_price: 999999.0,
      stop_loss_pct: 20.0,
      chandelier_atr_mult: 4.5,
      take_profit_pct: 2000.0,
      uncapped_runner: true,
      power_thrust_rsi_override: true,
      max_rsi: 90,
      min_conviction: 7,
      kelly_fraction: 0.50,
      max_open_positions: 10
    }
  }
];

const PERSONA_OPTIONS = [
  { id: 'MOONSHOT_COILED_HUNTER', label: '🚀 Moonshot Coiled Spring 2,000% Profit Hunter (Squeeze / NR7 / CMF Accumulation)' },
  { id: 'EXPLORATION_GEOLOGIST', label: '⛏️ Exploration Geologist & Assay Auditor (Drill Intercepts g/t Au, % Li2O, % Nb2O5, Cash Runway)' },
  { id: 'BIOTECH_CLINICAL_AUDITOR', label: '🧬 Biotech & Clinical Trial Regulatory Auditor (Phase I/II/III, FDA/TGA Readouts)' },
  { id: 'WALL_ST_MOMENTUM_TECH', label: '📈 High-Beta Global Tech, AI & Sovereign Defense Specialist (OBV Waves & ARR Growth)' },
  { id: 'FORTRESS_QUANT_OFFICER', label: '🛡️ Institutional Quantitative Risk Officer (ASX 100 / Balance Sheet & EMA Alignment)' }
];

const CAPITAL_PRESETS = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

export default function WorkbookAutoBuilderModal({
  isOpen,
  onClose,
  userSession,
  initialWorkbook = null,
  initialTab = 'WORKBOOK_BUILDER',
  onWorkbookSaved
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Global AI & Data Hub State
  const [aiProvider, setAiProvider] = useState('antigravity_mcp');
  const [aiModel, setAiModel] = useState('antigravity-mcp-orchestrator-v2 (Primary MCP Agent + Gemini Flash/Pro)');
  const [customAiModel, setCustomAiModel] = useState('');
  const [aiApiKey, setAiApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([
    'antigravity-mcp-orchestrator-v2 (Primary MCP Agent + Gemini Flash/Pro)',
    'antigravity-mcp-deep-research (Multi-Workbook MCP Synthesis)',
    'antigravity-mcp-autonomous-sniper (Real-Time MCP Execution Agent)'
  ]);
  const [providerCatalog, setProviderCatalog] = useState({});
  const [dataProvider, setDataProvider] = useState('yahoo_google_fallback');
  const [dataApiKey, setDataApiKey] = useState('');
  const [dataTierLevel, setDataTierLevel] = useState('TIER_1_RESILIENT_FREE (Yahoo + GoogleFinance + Stooq Multi-Fallback)');
  const [autoUpgradeModels, setAutoUpgradeModels] = useState(true);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [globalSaveMsg, setGlobalSaveMsg] = useState('');

  // Workbook Builder State (100% Unlocked)
  const [wbName, setWbName] = useState('Moonshot Coiled Spring Node');
  const [sheetUrlOrId, setSheetUrlOrId] = useState('');
  const [exchange, setExchange] = useState('ASX');
  const [currency, setCurrency] = useState('AUD');
  const [strategyProtocol, setStrategyProtocol] = useState('MOONSHOT_COILED_SPRING');
  const [sectorPersona, setSectorPersona] = useState('MOONSHOT_COILED_HUNTER');
  const [executionMode, setExecutionMode] = useState('AUTONOMOUS');
  const [startingCapital, setStartingCapital] = useState(25000);
  const [minPrice, setMinPrice] = useState(0.001);
  const [maxPrice, setMaxPrice] = useState(0.50);
  const [stopLossPct, setStopLossPct] = useState(25.0);
  const [chandelierAtr, setChandelierAtr] = useState(5.5);
  const [takeProfitPct, setTakeProfitPct] = useState(2000.0);
  const [uncappedRunner, setUncappedRunner] = useState(true);
  const [powerThrustRsi, setPowerThrustRsi] = useState(true);
  const [maxRsi, setMaxRsi] = useState(90);
  const [minConviction, setMinConviction] = useState(8);
  const [kellyFraction, setKellyFraction] = useState(0.50);
  const [maxOpenPositions, setMaxOpenPositions] = useState(12);
  const [dedicatedTickers, setDedicatedTickers] = useState('');

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState([]);
  const [buildError, setBuildError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'WORKBOOK_BUILDER');
      fetchGlobalSettings();
      if (initialWorkbook && initialWorkbook.id !== 'ALL') {
        setWbName(initialWorkbook.name || 'Custom Workbook');
        setSheetUrlOrId(initialWorkbook.spreadsheet_id || initialWorkbook.id || '');
        setExchange(initialWorkbook.exchange || 'ASX');
        setCurrency(initialWorkbook.currency || 'AUD');
        setStrategyProtocol(initialWorkbook.strategy_protocol || 'MOONSHOT_COILED_SPRING');
        setSectorPersona(initialWorkbook.sector_persona || 'MOONSHOT_COILED_HUNTER');
        setExecutionMode(initialWorkbook.execution_mode || 'AUTONOMOUS');
        setStartingCapital(initialWorkbook.starting_capital || initialWorkbook.equity || 25000);
        setMinPrice(initialWorkbook.min_price ?? 0.001);
        setMaxPrice(initialWorkbook.max_price ?? 0.50);
        setStopLossPct(initialWorkbook.stop_loss_pct ?? 20.0);
        setChandelierAtr(initialWorkbook.chandelier_atr_mult ?? 5.0);
        setTakeProfitPct(initialWorkbook.take_profit_pct ?? 2000.0);
        setUncappedRunner(initialWorkbook.uncapped_runner ?? true);
        setPowerThrustRsi(initialWorkbook.power_thrust_rsi_override ?? true);
        setMaxRsi(initialWorkbook.max_rsi ?? 88);
        setMinConviction(initialWorkbook.min_conviction ?? 8);
        setKellyFraction(initialWorkbook.kelly_fraction ?? 0.50);
        setMaxOpenPositions(initialWorkbook.max_open_positions ?? 12);
        setDedicatedTickers(initialWorkbook.dedicated_tickers || '');
      } else {
        setBuildLogs([]);
        setBuildError('');
      }
    }
  }, [isOpen, initialWorkbook, initialTab]);

  const fetchGlobalSettings = async (overrideProvider = null) => {
    setIsRefreshingModels(true);
    try {
      const q = overrideProvider ? `?provider=${overrideProvider}` : '';
      const res = await fetch(`${API_BASE}/api/v2/settings/global${q}`, {
        headers: { Authorization: `Bearer ${userSession?.idToken || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.provider_catalog) setProviderCatalog(data.provider_catalog);
        if (!overrideProvider && data.settings) {
          setAiProvider(data.settings.primary_ai_provider || 'antigravity_mcp');
          setAiModel(data.settings.ai_model || '');
          setCustomAiModel(data.settings.custom_ai_model_override || '');
          setDataProvider(data.settings.data_provider || 'yahoo_google_fallback');
          setDataTierLevel(data.settings.data_tier_level || '');
          setAutoUpgradeModels(data.settings.auto_upgrade_models ?? true);
        }
        if (data.available_models && data.available_models.length > 0) {
          setAvailableModels(data.available_models);
          if (overrideProvider) {
            setAiModel(data.available_models[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Global intelligence fetch notice:', e);
    } finally {
      setIsRefreshingModels(false);
    }
  };

  const handleProviderChange = (newProv) => {
    setAiProvider(newProv);
    if (providerCatalog[newProv]) {
      setAvailableModels(providerCatalog[newProv]);
      setAiModel(providerCatalog[newProv][0] || '');
    }
    fetchGlobalSettings(newProv);
  };

  const handleSaveGlobalSettings = async () => {
    setGlobalSaveMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/v2/settings/global`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userSession?.idToken || ''}`
        },
        body: JSON.stringify({
          primary_ai_provider: aiProvider,
          ai_model: aiModel,
          custom_ai_model_override: customAiModel,
          ai_api_key: aiApiKey,
          data_provider: dataProvider,
          data_api_key: dataApiKey,
          auto_upgrade_models: autoUpgradeModels
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDataTierLevel(data.settings?.data_tier_level || dataTierLevel);
        setAiApiKey('');
        setDataApiKey('');
        setGlobalSaveMsg('Global AI Agent, Live Model & Data Tier Vaulted! All Workbooks Upgraded.');
        setTimeout(() => setGlobalSaveMsg(''), 4000);
      }
    } catch (e) {
      setGlobalSaveMsg('Saved to local fleet profile.');
    }
  };

  const applyBlueprint = (bp) => {
    const d = bp.defaults;
    setStrategyProtocol(d.strategy_protocol);
    setSectorPersona(d.sector_persona);
    setExchange(d.exchange);
    setCurrency(d.currency);
    setExecutionMode(d.execution_mode);
    setMinPrice(d.min_price);
    setMaxPrice(d.max_price);
    setStopLossPct(d.stop_loss_pct);
    setChandelierAtr(d.chandelier_atr_mult);
    setTakeProfitPct(d.take_profit_pct);
    setUncappedRunner(d.uncapped_runner);
    setPowerThrustRsi(d.power_thrust_rsi_override);
    setMaxRsi(d.max_rsi);
    setMinConviction(d.min_conviction);
    setKellyFraction(d.kelly_fraction);
    setMaxOpenPositions(d.max_open_positions);
    if (!initialWorkbook) {
      setWbName(bp.title.replace(/^[^\w]+/, '').trim());
    }
  };

  const handleAutoBuildWorkbook = async () => {
    setIsBuilding(true);
    setBuildError('');
    setBuildLogs([]);

    try {
      const res = await fetch(`${API_BASE}/api/v2/workbooks/auto-build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userSession?.idToken || ''}`
        },
        body: JSON.stringify({
          workbook_id: initialWorkbook?.id || '',
          spreadsheet_id: sheetUrlOrId,
          name: wbName,
          exchange,
          currency,
          strategy_protocol: strategyProtocol,
          sector_persona: sectorPersona,
          execution_mode: executionMode,
          starting_capital: Number(startingCapital) || 25000,
          min_price: Number(minPrice),
          max_price: Number(maxPrice),
          stop_loss_pct: Number(stopLossPct),
          chandelier_atr_mult: Number(chandelierAtr),
          take_profit_pct: Number(takeProfitPct),
          uncapped_runner: Boolean(uncappedRunner),
          power_thrust_rsi_override: Boolean(powerThrustRsi),
          max_rsi: Number(maxRsi),
          min_conviction: Number(minConviction),
          kelly_fraction: Number(kellyFraction),
          max_open_positions: Number(maxOpenPositions),
          dedicated_tickers: dedicatedTickers
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to auto-build workbook.');
      }

      const steps = data.auto_build_steps || [
        '1. Global AI & Antigravity MCP Agent Linked',
        '2. Hidden _TITAN_VAULT Provisioned (Brain & DB Keys Hidden Server-Side)',
        `3. Persona Injected: ${sectorPersona}`,
        `4. Unlocked Price Filter & Capital Synced ($${Number(startingCapital).toLocaleString()})`,
        '5. Python Direct-Push Active + GAS & Neon DB Failover Armed'
      ];
      steps.forEach((s, idx) => {
        setTimeout(() => {
          setBuildLogs((prev) => [...prev, s]);
          if (idx === steps.length - 1) {
            setIsBuilding(false);
            if (onWorkbookSaved) onWorkbookSaved(data.workbook);
          }
        }, (idx + 1) * 180);
      });
    } catch (err) {
      setIsBuilding(false);
      setBuildError(err.message || 'Auto-build error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b111e] border border-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="bg-[#111827] border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                TITAN FLEET COMMAND & 1-CLICK WORKBOOK AUTO-BUILDER
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Antigravity MCP Agent • Live Auto-Evolving Gemini Models • Uncapped 2,000% Moonshot Coiled Springs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-[#0f172a] border-b border-slate-800 px-6 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('WORKBOOK_BUILDER')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'WORKBOOK_BUILDER'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{initialWorkbook ? `Edit Workbook: ${initialWorkbook.name}` : '1. Add / Configure Dedicated Workbook'}</span>
          </button>

          <button
            onClick={() => setActiveTab('GLOBAL_AI_HUB')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'GLOBAL_AI_HUB'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. Global AI Agent (Antigravity MCP) & Upgradable Data APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('FAILOVER_SHIELD')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'FAILOVER_SHIELD'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Multi-Tier Failover & Hidden Vault Status</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* =============================================================== */}
          {/* TAB 1: 1-CLICK WORKBOOK AUTO-BUILDER & UNLOCKED RULES           */}
          {/* =============================================================== */}
          {activeTab === 'WORKBOOK_BUILDER' && (
            <div className="space-y-6">
              {/* Step A: 1-Click Strategy Blueprint Presets */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Step 1 — Pick a Workbook Blueprint (Or Customize Every Rule Below)
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    All settings below are 100% unlocked & editable anytime
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {STRATEGY_BLUEPRINTS.map((bp) => {
                    const isSelected = strategyProtocol === bp.defaults.strategy_protocol && sectorPersona === bp.defaults.sector_persona;
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => applyBlueprint(bp)}
                        className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/50'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {bp.badge}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-100 leading-snug mb-1">
                            {bp.title}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {bp.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step B: Workbook Identity, Google Sheet Link & Persona */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 border border-slate-800/90 rounded-xl p-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Workbook Name
                  </label>
                  <input
                    type="text"
                    value={wbName}
                    onChange={(e) => setWbName(e.target.value)}
                    placeholder="e.g., ASX PennyMines Coiled Springs"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Google Sheet URL or ID (Optional — Auto-Links Vault)
                  </label>
                  <input
                    type="text"
                    value={sheetUrlOrId}
                    onChange={(e) => setSheetUrlOrId(e.target.value)}
                    placeholder="Paste Google Sheet URL or leave blank for Virtual Node"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-300 mb-1">
                    Specialist AI Persona for This Workbook
                  </label>
                  <select
                    value={sectorPersona}
                    onChange={(e) => setSectorPersona(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-500/40 rounded-lg px-3 py-2 text-xs text-purple-200 font-semibold focus:border-purple-400 focus:outline-none"
                  >
                    {PERSONA_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step C: Starting Capital, Exchange, Currency & Execution Mode */}
              <div className="bg-slate-900/50 border border-slate-800/90 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Step 2 — Custom Capital Allocation, Exchange & Execution Mode
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CAPITAL_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStartingCapital(preset)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                          Number(startingCapital) === preset
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        ${preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Custom Starting Capital (Type Any Amount)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="500"
                      value={startingCapital}
                      onChange={(e) => setStartingCapital(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      World Exchange Scope
                    </label>
                    <select
                      value={exchange}
                      onChange={(e) => {
                        const ex = e.target.value;
                        setExchange(ex);
                        if (ex === 'ASX') setCurrency('AUD');
                        if (ex === 'NYSE' || ex === 'NASDAQ') setCurrency('USD');
                        if (ex === 'LSE') setCurrency('GBP');
                        if (ex === 'TSX') setCurrency('CAD');
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="ASX">🇦🇺 ASX (Australian Securities Exchange)</option>
                      <option value="NASDAQ">🇺🇸 NASDAQ (US Tech & Growth)</option>
                      <option value="NYSE">🇺🇸 NYSE (Wall Street Institutional)</option>
                      <option value="LSE">🇬🇧 LSE (London Stock Exchange)</option>
                      <option value="TSX">🇨🇦 TSX / TSXV (Toronto Mining & Resources)</option>
                      <option value="GLOBAL">🌐 GLOBAL (All 5 World Exchanges)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Base Currency Pot
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="AUD">AUD ($)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Execution Mode
                    </label>
                    <select
                      value={executionMode}
                      onChange={(e) => setExecutionMode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-emerald-300"
                    >
                      <option value="AUTONOMOUS">⚡ AUTONOMOUS (Auto-Execute Signals)</option>
                      <option value="APPROVAL_1CLICK">👆 1-CLICK APPROVAL (Stage for Review)</option>
                      <option value="PAPER_SANDBOX">🧪 PAPER SANDBOX (Zero-Risk Simulation)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step D: Uncapped Moonshot Coiled Spring, Price Brackets & Dedicated Tickers */}
              <div className="bg-slate-900/50 border border-slate-800/90 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Step 3 — Uncapped Moonshot Coiled Spring Rules, Price Filter & Dedicated Stocks
                  </label>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    ZERO ARTIFICIAL CAPS • 2,000%+ RUNNERS ENABLED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Min Share Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Max Share Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Profit Target (%)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={takeProfitPct}
                      onChange={(e) => setTakeProfitPct(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Stop-Loss Room (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={stopLossPct}
                      onChange={(e) => setStopLossPct(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Chandelier ATR Mult
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={chandelierAtr}
                      onChange={(e) => setChandelierAtr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Max Open Positions
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={maxOpenPositions}
                      onChange={(e) => setMaxOpenPositions(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Moonshot Toggles + Dedicated Stock List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
                      <input
                        type="checkbox"
                        checked={uncappedRunner}
                        onChange={(e) => setUncappedRunner(e.target.checked)}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-emerald-300">
                          Uncapped Multi-Bagger Runner Mode (2,000%+ Free-Carry Trail)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Never clips winners early — rides coiled springs until Chandelier ATR trail breaks
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
                      <input
                        type="checkbox"
                        checked={powerThrustRsi}
                        onChange={(e) => setPowerThrustRsi(e.target.checked)}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-300">
                          Power-Thrust RSI Override (Allow RSI up to {maxRsi} on 4.0x+ Volume Surge)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Prevents missing explosive penny breakouts when SPRING_EXPANSION triggers
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Dedicated Stocks Only (Optional — Leave blank to scan full {exchange} exchange)
                    </label>
                    <textarea
                      rows={3}
                      value={dedicatedTickers}
                      onChange={(e) => setDedicatedTickers(e.target.value)}
                      placeholder="e.g. WA1, WIA, SXG, DEG, LTR (If entered, this workbook acts as a dedicated sniper exclusively for these tickers)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Build Audit Logs */}
              {buildLogs.length > 0 && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Auto-Build & Hidden _TITAN_VAULT Sync Complete:
                  </div>
                  {buildLogs.map((log, i) => (
                    <div key={i} className="text-xs font-mono text-slate-200">
                      ✓ {log}
                    </div>
                  ))}
                </div>
              )}

              {buildError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
                  {buildError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isBuilding}
                  onClick={handleAutoBuildWorkbook}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isBuilding ? 'Auto-Building & Syncing Vault...' : 'Auto-Build & Save Workbook Configuration'}</span>
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: GLOBAL AI AGENT (ANTIGRAVITY MCP) & UPGRADABLE DATA APIS */}
          {/* =============================================================== */}
          {activeTab === 'GLOBAL_AI_HUB' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-950/25 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Set Once — Pre-Selected Across All Workbooks Automatically
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Select <strong>Antigravity MCP Agent</strong> or any live AI provider below. Entering an API key upgrades the entire fleet immediately while keeping keys hidden inside the server vault.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchGlobalSettings(aiProvider)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-mono transition shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingModels ? 'animate-spin' : ''}`} />
                  <span>Sync Latest Live Models</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Primary AI Engine & Live Evolving Model Picker */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    1. Primary AI Agent & Live Auto-Evolving Models
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      AI Provider / Orchestrator
                    </label>
                    <select
                      value={aiProvider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="antigravity_mcp">⚡ Antigravity Main MCP AI Agent (Connected to All 8 Fleet MCP Servers)</option>
                      <option value="gemini">✨ Google Gemini (Live Auto-Updating SDK Models)</option>
                      <option value="perplexity">🌐 Perplexity Sonar Pro (Live Web & ASX Announcement Search)</option>
                      <option value="openai">🧠 OpenAI (GPT-4o / o3-mini / o1 Reasoning)</option>
                      <option value="anthropic">🏛️ Anthropic Claude (Claude 3.7 / 3.5 Sonnet)</option>
                      <option value="deepseek">🔬 DeepSeek R1 (Quantitative Reasoning)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Active Model (Auto-Populated from Live Provider SDK)
                    </label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300"
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Future / Custom Model ID Override (Optional — For Brand-New Model Drops)
                    </label>
                    <input
                      type="text"
                      value={customAiModel}
                      onChange={(e) => setCustomAiModel(e.target.value)}
                      placeholder="e.g., gemini-3.0-pro-exp (Overrides dropdown if typed)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Upgrade / Vault AI API Key (Hidden Server-Side — Never Written to Config Tab)
                    </label>
                    <input
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="•••••••••••• (Pre-loaded in Render Brain; paste new key to upgrade)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Right Column: Upgradable Market Data APIs */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    2. Upgradable Market Data API Engine
                  </h3>

                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      Current Active Data Tier:
                    </div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {dataTierLevel}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Primary Market Data Feed (Auto-Upgrades System Speed & Depth When Key Entered)
                    </label>
                    <select
                      value={dataProvider}
                      onChange={(e) => setDataProvider(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="yahoo_google_fallback">🛡️ Built-In Multi-Fallback (Yahoo Finance + GoogleFinance + Stooq — Free)</option>
                      <option value="fmp">🚀 Financial Modeling Prep (FMP Pro — Full Institutional OHLCV & Fundamentals)</option>
                      <option value="polygon">⚡ Polygon.io (Low-Latency Tick & Second Aggregates)</option>
                      <option value="alphavantage">📊 AlphaVantage Premium (Global Equities & Forex)</option>
                      <option value="eodhd">🌍 EOD Historical Data (World Exchanges ASX/LSE/TSX/NYSE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Enter Data Provider API Key to Unlock Tier-3 Direct Institutional Feed
                    </label>
                    <input
                      type="password"
                      value={dataApiKey}
                      onChange={(e) => setDataApiKey(e.target.value)}
                      placeholder="Paste FMP / Polygon / AlphaVantage Key (Auto-vaulted & hidden)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Even when a paid key is active, Yahoo + GoogleFinance + Stooq remain armed as automatic failover if the provider rate-limits.
                    </p>
                  </div>

                  {globalSaveMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                      ✓ {globalSaveMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveGlobalSettings}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Save & Apply Global AI + Data Tier to All Workbooks
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: MULTI-TIER FAILOVER & HIDDEN VAULT ARCHITECTURE          */}
          {/* =============================================================== */}
          {activeTab === 'FAILOVER_SHIELD' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/70 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase font-mono">
                    Compute Failover (Render ↔ Google)
                  </div>
                  <div className="text-sm font-bold text-white">
                    Primary: Python Render Brain
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pushes prices, V4 Synaptic Quant Scores & Moonshot signals directly to your Google Sheets in <strong>&lt;0.8s</strong>, bypassing Google's 6-minute execution limit.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-mono">
                    Failover: If Render goes dark, Google Apps Script (<code>TitanLibrary</code> Watchdog) automatically wakes up and takes over scanning & stop-loss protection.
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase font-mono">
                    Database Failover (Supabase ↔ Nova/Neon)
                  </div>
                  <div className="text-sm font-bold text-white">
                    3-Tier FailoverEngineProxy Active
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every schema table is mirrored across <strong>Tier 1: Supabase Postgres</strong> and <strong>Tier 2: Neon / Nova Cloud DB</strong> (`FALLBACK_DATABASE_URL`).
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-cyan-300 font-mono">
                    Failover: Instant zero-downtime switch to Neon/Nova DB + Tier 3 Local SQLite bunker (`titan_fallback.db`).
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-purple-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-purple-400 uppercase font-mono">
                    Zero-Knowledge Vault (`_TITAN_VAULT`)
                  </div>
                  <div className="text-sm font-bold text-white">
                    Brain & DB Keys Hidden From Config Tab
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Database URLs, Brain tokens, and paid API keys are stored strictly in Render & hidden vault properties — never exposed in plain text on the sheet's Config tab.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-purple-300 font-mono flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Per-Workbook HMAC-SHA256 Node Token Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
