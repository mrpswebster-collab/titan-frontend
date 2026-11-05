import React, { useState, useEffect } from 'react';
import DualClockTelemetryBar from './components/DualClockTelemetryBar';
import ExchangeSwitcherTabs from './components/ExchangeSwitcherTabs';
import UniversalTierSelector from './components/UniversalTierSelector';
import InteractiveKinematicDrawer from './components/InteractiveKinematicDrawer';
import FinTechProSuiteModal from './components/FinTechProSuiteModal';
import BacktestLabModal from './components/BacktestLabModal';
import PortfolioHoldingsView from './components/PortfolioHoldingsView';
import AIAnalystTerminalView from './components/AIAnalystTerminalView';
import InstitutionalGateAndSetupWizard from './components/InstitutionalGateAndSetupWizard';
import WorkbookAutoBuilderModal from './components/WorkbookAutoBuilderModal';
import ProCockpitView from './components/ProCockpitView';
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  FileSpreadsheet,
  LogOut,
  SlidersHorizontal, 
  RefreshCw, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Cpu,
  Moon,
  FlaskConical,
  Briefcase,
  LayoutGrid
} from 'lucide-react';

const MOCK_TICKERS = {
  ASX: {
    TIER_3: [
      { ticker: 'WA1', name: 'WA1 Resources Ltd', price: 14.50, change: 8.4, conviction: 'C:9', rsi: 48.2, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'AUD', sector: 'Niobium / Critical Minerals' },
      { ticker: 'WIA', name: 'Wia Gold Limited', price: 0.145, change: 11.5, conviction: 'C:8', rsi: 41.5, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'AUD', sector: 'Gold Exploration (Kokoseb)' },
      { ticker: 'LTR', name: 'Liontown Resources', price: 0.72, change: 3.2, conviction: 'C:7', rsi: 39.0, macd: 'COILED', obv: 'FLAT', currency: 'AUD', sector: 'Lithium Spodumene' },
      { ticker: 'SXG', name: 'Southern Cross Gold', price: 3.10, change: 6.8, conviction: 'C:8', rsi: 44.1, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'AUD', sector: 'Sunday Creek Assay' }
    ],
    TIER_1: [
      { ticker: 'BHP', name: 'BHP Group Limited', price: 41.25, change: 0.8, conviction: 'C:10', rsi: 52.0, macd: 'STABLE', obv: 'NEUTRAL', currency: 'AUD', sector: 'Diversified Metals' },
      { ticker: 'CBA', name: 'Commonwealth Bank', price: 154.20, change: -0.4, conviction: 'C:9', rsi: 58.4, macd: 'CONSOLIDATING', obv: 'NEUTRAL', currency: 'AUD', sector: 'Tier 1 Banking' },
      { ticker: 'CSL', name: 'CSL Limited', price: 298.50, change: 1.2, conviction: 'C:10', rsi: 46.8, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'AUD', sector: 'Biotechnology / Plasma' }
    ],
    TIER_2: [
      { ticker: 'PLS', name: 'Pilbara Minerals', price: 2.85, change: 4.8, conviction: 'C:8', rsi: 43.5, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'AUD', sector: 'Lithium Extraction' },
      { ticker: 'NST', name: 'Northern Star Resources', price: 17.80, change: 2.1, conviction: 'C:9', rsi: 55.2, macd: 'EXPANDING', obv: 'NEUTRAL', currency: 'AUD', sector: 'Gold Producer' }
    ],
    POI_SNIPER: [
      { ticker: 'DEG', name: 'De Grey Mining Ltd', price: 1.42, change: 5.1, conviction: 'C:9', rsi: 45.0, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'AUD', sector: 'Hemi Gold Discovery' },
      { ticker: 'EMR', name: 'Emerald Resources', price: 3.95, change: 1.8, conviction: 'C:9', rsi: 51.2, macd: 'STEADY', obv: 'NEUTRAL', currency: 'AUD', sector: 'Okvau Gold Project' }
    ]
  },
  NYSE: {
    TIER_3: [
      { ticker: 'SOUN', name: 'SoundHound AI Inc', price: 4.82, change: 14.2, conviction: 'C:9', rsi: 42.1, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'USD', sector: 'Conversational Voice AI' },
      { ticker: 'ASTS', name: 'AST SpaceMobile Inc', price: 24.15, change: 7.8, conviction: 'C:8', rsi: 47.5, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'USD', sector: 'Direct-to-Cell Satellite' },
      { ticker: 'ACHR', name: 'Archer Aviation Inc', price: 3.92, change: 9.1, conviction: 'C:8', rsi: 38.6, macd: 'COILED', obv: 'ACCUMULATING', currency: 'USD', sector: 'eVTOL Urban Air Mobility' },
      { ticker: 'PLUG', name: 'Plug Power Inc', price: 2.15, change: -1.2, conviction: 'C:6', rsi: 34.2, macd: 'BASE_FORMING', obv: 'FLAT', currency: 'USD', sector: 'Hydrogen Electrolyzers' }
    ],
    TIER_1: [
      { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 138.25, change: 2.4, conviction: 'C:10', rsi: 56.4, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'USD', sector: 'Semiconductors / AI Datacenter' },
      { ticker: 'AAPL', name: 'Apple Inc.', price: 232.10, change: 0.5, conviction: 'C:9', rsi: 49.8, macd: 'STABLE', obv: 'NEUTRAL', currency: 'USD', sector: 'Consumer Tech & Services' },
      { ticker: 'MSFT', name: 'Microsoft Corporation', price: 428.50, change: 1.1, conviction: 'C:10', rsi: 51.2, macd: 'CONSOLIDATING', obv: 'NEUTRAL', currency: 'USD', sector: 'Enterprise Cloud & Copilot' }
    ],
    TIER_2: [
      { ticker: 'PLTR', name: 'Palantir Technologies', price: 44.80, change: 6.2, conviction: 'C:9', rsi: 58.1, macd: 'SURGING', obv: 'SURGING', currency: 'USD', sector: 'Enterprise AI AIP' },
      { ticker: 'CRWD', name: 'CrowdStrike Holdings', price: 312.40, change: 3.5, conviction: 'C:8', rsi: 47.9, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'USD', sector: 'Cloud Cybersecurity' }
    ],
    POI_SNIPER: [
      { ticker: 'RGTI', name: 'Rigetti Computing', price: 1.85, change: 18.5, conviction: 'C:8', rsi: 44.0, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'USD', sector: 'Superconducting Quantum' },
      { ticker: 'IONQ', name: 'IonQ Inc', price: 15.60, change: 8.9, conviction: 'C:8', rsi: 49.2, macd: 'EXPANDING', obv: 'ACCUMULATING', currency: 'USD', sector: 'Trapped-Ion Quantum Computing' }
    ]
  },
  LSE: {
    TIER_3: [
      { ticker: 'PREM', name: 'Premier African Minerals', price: 0.052, change: 12.8, conviction: 'C:7', rsi: 39.4, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'GBP', sector: 'Zulu Lithium Project' },
      { ticker: 'KOD', name: 'Kodal Minerals PLC', price: 0.38, change: 7.2, conviction: 'C:8', rsi: 44.1, macd: 'COILED', obv: 'ACCUMULATING', currency: 'GBP', sector: 'Bougouni Lithium Mine' }
    ],
    TIER_1: [
      { ticker: 'AZN', name: 'AstraZeneca PLC', price: 11850.0, change: 0.9, conviction: 'C:10', rsi: 50.1, macd: 'STABLE', obv: 'NEUTRAL', currency: 'GBP', sector: 'Pharmaceutical Oncology' },
      { ticker: 'SHEL', name: 'Shell PLC', price: 2640.0, change: 1.4, conviction: 'C:9', rsi: 53.8, macd: 'CONSOLIDATING', obv: 'NEUTRAL', currency: 'GBP', sector: 'Integrated Energy' }
    ],
    TIER_2: [
      { ticker: 'RR', name: 'Rolls-Royce Holdings', price: 542.0, change: 3.8, conviction: 'C:9', rsi: 57.2, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'GBP', sector: 'Civil Aerospace & SMR' }
    ],
    POI_SNIPER: [
      { ticker: 'GGP', name: 'Greatland Gold PLC', price: 6.95, change: 6.4, conviction: 'C:8', rsi: 43.8, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'GBP', sector: 'Havieron Gold-Copper' }
    ]
  },
  TSX: {
    TIER_3: [
      { ticker: 'PMET', name: 'Patriot Battery Metals', price: 4.85, change: 9.8, conviction: 'C:8', rsi: 42.5, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'CAD', sector: 'Corvette Lithium Pegmatite' },
      { ticker: 'FIL', name: 'Filo Mining Corp', price: 21.40, change: 4.2, conviction: 'C:9', rsi: 48.9, macd: 'STEADY', obv: 'ACCUMULATING', currency: 'CAD', sector: 'Filo del Sol Copper-Gold' }
    ],
    TIER_1: [
      { ticker: 'SHOP', name: 'Shopify Inc', price: 108.50, change: 2.8, conviction: 'C:9', rsi: 54.2, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'CAD', sector: 'Global E-Commerce Platform' }
    ],
    TIER_2: [
      { ticker: 'IVN', name: 'Ivanhoe Mines Ltd', price: 18.25, change: 3.1, conviction: 'C:9', rsi: 52.4, macd: 'STEADY', obv: 'NEUTRAL', currency: 'CAD', sector: 'Kamoa-Kakula Ultra Copper' }
    ],
    POI_SNIPER: [
      { ticker: 'EU', name: 'EnCore Energy Corp', price: 4.12, change: 7.5, conviction: 'C:8', rsi: 45.6, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'CAD', sector: 'In-Situ Uranium Extraction' }
    ]
  }
};

const PERSONAS = [
  { id: 'GEOLOGIST', label: '⛏️ Mining Geologist', desc: 'Exploration assays, drill grade-thickness & commodity trends' },
  { id: 'BIOTECH', label: '🧬 Biotech Clinical Auditor', desc: 'FDA/TGA clinical phases, primary endpoints & cash runway' },
  { id: 'TECH', label: '💻 Tech & Defense Momentum', desc: 'ARR growth, sovereign contract wins & volume waves' },
  { id: 'RISK_OFFICER', label: '🛡️ Institutional Risk Officer', desc: 'Balance sheet durability, FCF yield & drawdown gates' }
];

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState('SCANNER'); // 'SCANNER', 'PORTFOLIO', 'AI_TERMINAL'
  const [activeExchange, setActiveExchange] = useState('ASX');
  const [activeTier, setActiveTier] = useState('TIER_3');
  const [activePersona, setActivePersona] = useState('GEOLOGIST');
  const [exchangeData, setExchangeData] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [isFinTechProOpen, setIsFinTechProOpen] = useState(false);
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [stagedNotification, setStagedNotification] = useState(null);

  // Workspace Layout Mode: 'COCKPIT' (Admin Pro) vs. 'STANDARD' (Retail Multi-Tab)
  const [layoutMode, setLayoutMode] = useState(() => {
    try {
      return localStorage.getItem('titan_layout_mode') || 'STANDARD';
    } catch (e) {
      return 'STANDARD';
    }
  });

  // User session with persistent localStorage authentication (requires cryptographic idToken)
  const [userSession, setUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem('titan_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.idToken && parsed.isAuthed) {
          return parsed;
        }
        // Purge any legacy unverified email-only session
        localStorage.removeItem('titan_user_session');
      }
    } catch (e) {}
    return {
      isAuthed: false,
      hasCompletedSetup: false,
      email: '',
      name: '',
      tenantId: '',
      idToken: '',
      startingCapital: 25000,
      currency: 'AUD',
      kellyFraction: 0.25,
      spreadsheetId: ''
    };
  });

  // Poll exchange clock status from the live Render backend
  const fetchExchangeStatus = async () => {
    try {
      const res = await fetch('https://asx-quant-brain.onrender.com/api/v2/exchanges/status');
      if (res.ok) {
        const data = await res.json();
        setExchangeData(data.exchanges);
      }
    } catch (e) {
      console.warn('Backend exchange clock fetch notice:', e);
    }
  };

  useEffect(() => {
    fetchExchangeStatus();
    const interval = setInterval(fetchExchangeStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStageOrder = (ticker, data) => {
    const ceilingPrice = (data.price * 1.01).toFixed(3);
    setStagedNotification({
      ticker,
      price: ceilingPrice,
      currency: data.currency
    });
    setSelectedTicker(null);
    setTimeout(() => setStagedNotification(null), 5000);
  };

  const handleLoginSuccess = (session) => {
    const updated = { ...session, isAuthed: true, hasCompletedSetup: true };
    setUserSession(updated);
    try { localStorage.setItem('titan_user_session', JSON.stringify(updated)); } catch(e) {}
  };

  const handleCompleteSetup = (completedSession) => {
    setUserSession({ ...completedSession, isAuthed: true, hasCompletedSetup: true });
    try { localStorage.setItem('titan_user_session', JSON.stringify({ ...completedSession, isAuthed: true, hasCompletedSetup: true })); } catch(e) {}
    setActiveMainTab('PORTFOLIO');
  };

  const handleLogout = () => {
    const reset = {
      isAuthed: false,
      hasCompletedSetup: false,
      email: '',
      name: '',
      tenantId: '',
      currency: 'AUD',
      spreadsheetId: ''
    };
    setUserSession(reset);
    try { localStorage.removeItem('titan_user_session'); } catch(e) {}
  };

  // =========================================================================
  // ZERO-TRUST GATE: Require cryptographic Google OAuth login, then go straight
  // into the live Terminal (no clumsy 4-step setup blocker!)
  // =========================================================================
  if (!userSession.isAuthed) {
    return (
      <InstitutionalGateAndSetupWizard
        userSession={userSession}
        onLoginSuccess={handleLoginSuccess}
        onCompleteSetup={handleCompleteSetup}
        onLogout={handleLogout}
      />
    );
  }

  const currentExMeta = exchangeData?.[activeExchange] || {};
  const isExtendedHours = currentExMeta.session_phase === 'PRE_MARKET' || currentExMeta.session_phase === 'AFTER_HOURS';
  const tickerList = MOCK_TICKERS[activeExchange]?.[activeTier] || [];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* 1. Dual-Clock World Exchange Telemetry Bar */}
      <DualClockTelemetryBar
        activeExchange={activeExchange}
        exchangeData={exchangeData}
        onRefresh={fetchExchangeStatus}
      />

      {/* 2. Top Portal Header */}
      <header className="bg-[#111827] border-b border-slate-800 px-4 py-3 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950 font-bold text-slate-950">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-slate-100">
                  TITAN <span className="text-emerald-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">SAAS V2</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AUTHENTICATED FLEET: {userSession.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Click Workbook Auto-Builder & Global AI (Antigravity MCP) Hub */}
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition"
              title="Open 1-Click Workbook Auto-Builder & Global AI (Antigravity MCP) Hub"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Workbook Builder & Global AI</span>
            </button>

            {/* FinTech Pro Add-On Toggle */}
            <button
              onClick={() => setIsFinTechProOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>FinTech Pro</span>
            </button>

            {/* Lock / Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/50 text-xs font-mono transition"
              title="Sign Out & Lock Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Lock Gate</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Primary App Navigation Bar */}
      <nav className="bg-[#0f172a] border-b border-slate-800 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveMainTab('SCANNER')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'SCANNER'
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Markets & Scanner</span>
            </button>

            <button
              onClick={() => setActiveMainTab('PORTFOLIO')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'PORTFOLIO'
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>My Portfolio & Holdings</span>
            </button>

            <button
              onClick={() => setActiveMainTab('AI_TERMINAL')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'AI_TERMINAL'
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Analyst Terminal</span>
            </button>

            <button
              onClick={() => setIsBacktestOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Backtest Lab</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Tenant: <strong className="text-slate-200">{userSession.tenantId || 'TENANT-ALPHA'}</strong></span>
          </div>
        </div>
      </nav>

      {/* Notification Toast for Staged Orders */}
      {stagedNotification && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/40 px-4 py-2 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <strong>ORDER STAGED:</strong> BUY {stagedNotification.ticker} limit ceiling {stagedNotification.currency} ${stagedNotification.price} (2% Chase Cap enforced).
            </span>
            <span className="text-[10px] text-emerald-400/80">Pending Broker Routing</span>
          </div>
        </div>
      )}

      {/* Extended Hours Caution Alert */}
      {isExtendedHours && (
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 text-amber-300 text-xs font-mono">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>EXTENDED HOURS NOTICE ({currentExMeta.session_phase}):</strong> Liquidity spreads are wider. 2% chase limits strictly enforce ceiling limits on all market submissions.
            </span>
          </div>
        </div>
      )}

      {/* WORKSPACE CONTENT: PRO COCKPIT VS. STANDARD (RETAIL) TABS */}
      {layoutMode === 'COCKPIT' ? (
        <main className="w-full flex-1">
          <ProCockpitView
            userSession={userSession}
            activeExchange={activeExchange}
            onSelectExchange={setActiveExchange}
            activeTier={activeTier}
            onSelectTier={setActiveTier}
            activePersona={activePersona}
            onSelectPersona={setActivePersona}
            tickerList={tickerList}
            exchangeData={exchangeData}
            onSelectTicker={(item) => setSelectedTicker(item)}
            onOpenWorkbookBuilder={() => setShowSetupModal(true)}
            onOpenBacktest={() => setIsBacktestOpen(true)}
            stagedNotification={stagedNotification}
            onStageOrder={handleStageOrder}
            onOpenAIAnalyst={() => {
              setLayoutMode('STANDARD');
              setActiveMainTab('AI_TERMINAL');
            }}
          />
        </main>
      ) : (
        <>
          {/* TAB 1: MARKETS & SCANNER */}
      {activeMainTab === 'SCANNER' && (
        <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
          {/* Exchange Switcher Tabs */}
          <ExchangeSwitcherTabs
            activeExchange={activeExchange}
            onSelectExchange={setActiveExchange}
            exchangeData={exchangeData}
          />

          {/* AI Sector Persona Bar */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Active Quantitative Sector Persona
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Weighting Model: Machine Learning Sentiment Grounding
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id)}
                  className={`text-left p-2.5 rounded-lg border transition ${
                    activePersona === p.id
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{p.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Universal Tier Selector */}
          <UniversalTierSelector
            activeTier={activeTier}
            onSelectTier={setActiveTier}
            counts={{
              TIER_3: MOCK_TICKERS[activeExchange]?.TIER_3?.length || 0,
              TIER_1: MOCK_TICKERS[activeExchange]?.TIER_1?.length || 0,
              TIER_2: MOCK_TICKERS[activeExchange]?.TIER_2?.length || 0,
              POI_SNIPER: MOCK_TICKERS[activeExchange]?.POI_SNIPER?.length || 0
            }}
          />

          {/* Asset Scanner Table */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#131b2e]">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{activeExchange} {activeTier.replace('_', ' ')} Watchlist</span>
                  <span className="text-xs font-normal text-slate-400">({tickerList.length} assets active)</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Vectorized RSI (14), EMA Cross & MACD Real-Time Telemetry
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBacktestOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simulate Strategy</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0f172a] text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Symbol / Name</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Change</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4">RSI (14)</th>
                    <th className="py-3 px-4">MACD Hook</th>
                    <th className="py-3 px-4">Volume OBV</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tickerList.map((item) => (
                    <tr
                      key={item.ticker}
                      onClick={() => setSelectedTicker(item)}
                      className="hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-mono text-sm">{item.ticker}</span>
                          <span className="text-[11px] text-slate-400 font-normal truncate max-w-[140px]">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[160px]">
                        {item.sector}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-100">
                        {item.currency} ${item.price.toFixed(item.price < 1 ? 4 : 2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span className={`inline-flex items-center gap-0.5 ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                          {item.conviction}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={item.rsi < 40 ? 'text-emerald-400 font-bold' : item.rsi > 70 ? 'text-rose-400' : 'text-slate-300'}>
                            {item.rsi.toFixed(1)}
                          </span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${item.rsi < 40 ? 'bg-emerald-400' : item.rsi > 70 ? 'bg-rose-400' : 'bg-slate-500'}`}
                              style={{ width: `${Math.min(item.rsi, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.macd === 'BULLISH_HOOK'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.macd}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] ${
                          item.obv === 'SURGING'
                            ? 'text-cyan-400 font-bold'
                            : item.obv === 'ACCUMULATING'
                              ? 'text-emerald-300'
                              : 'text-slate-400'
                        }`}>
                          {item.obv}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicker(item);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-black text-slate-200 text-[10px] font-bold transition"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* TAB 2: PORTFOLIO & WORKBOOK FLEET */}
      {activeMainTab === 'PORTFOLIO' && (
        <PortfolioHoldingsView
          userSession={userSession}
          onUpdateSession={(updated) => {
            setUserSession(updated);
            try { localStorage.setItem('titan_user_session', JSON.stringify(updated)); } catch(e) {}
          }}
          onSelectTicker={(t) => {
            const found = {
              ticker: t.ticker,
              name: t.company,
              price: t.livePrice,
              change: t.plPct,
              conviction: 'C:9',
              currency: t.currency
            };
            setSelectedTicker(found);
          }}
        />
      )}

      {/* TAB 3: AI ANALYST TERMINAL */}
      {activeMainTab === 'AI_TERMINAL' && (
        <AIAnalystTerminalView
          onStageFromAI={(t) => {
            setSelectedTicker({
              ticker: t,
              name: t,
              price: 14.50,
              conviction: 'C:9',
              currency: 'AUD'
            });
          }}
        />
      )}
        </>
      )}

      {/* Footer with ASIC Statutory Disclaimer */}
      <footer className="bg-[#0f172a] border-t border-slate-800/80 px-4 py-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">TITAN QUANTITATIVE SYSTEMS</span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                AUTHENTICATED FLEET: {userSession.name}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Engine: TITAN V2 Multi-Tenant • Sydney / Wall St Gateway
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            <strong>ASIC Statutory Disclaimer:</strong> This system is an automated algorithmic research and risk-management tool. It does not constitute personal financial product advice. All trading execution and capital allocation risk is borne entirely by the user. Past quantitative performance is not a reliable indicator of future market returns.
          </p>
        </div>
      </footer>

      {/* Interactive Kinematic Drawer */}
      <InteractiveKinematicDrawer
        ticker={selectedTicker?.ticker}
        data={selectedTicker}
        userEquity={userSession.startingCapital || 25000}
        onClose={() => setSelectedTicker(null)}
        onExecuteOrder={handleStageOrder}
      />

      {/* FinTech Pro Add-On Modal */}
      <FinTechProSuiteModal
        isOpen={isFinTechProOpen}
        onClose={() => setIsFinTechProOpen(false)}
      />

      {/* 1-Click Workbook Auto-Builder & Global AI (Antigravity MCP) Hub Modal */}
      <WorkbookAutoBuilderModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        userSession={userSession}
        initialTab="WORKBOOK_BUILDER"
        onWorkbookSaved={() => {
          setShowSetupModal(false);
          setActiveMainTab('PORTFOLIO');
        }}
      />

      {/* Backtest Simulation Lab Modal */}
      <BacktestLabModal
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
        defaultTicker={selectedTicker?.ticker || 'WA1'}
        defaultExchange={activeExchange}
      />
    </div>
  );
}
