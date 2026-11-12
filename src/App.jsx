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
import HelpTooltip from './components/HelpTooltip';
import GuidedTourModal from './components/GuidedTourModal';
import FleetSetupView from './components/FleetSetupView';
import EnclaveDropdownMenu from './components/EnclaveDropdownMenu';
import SequencedTradingRunwayModal from './components/SequencedTradingRunwayModal';

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
  Sun,
  BookOpen,
  FlaskConical,
  Briefcase,
  LayoutGrid,
  ExternalLink,
  Key,
  Database,
  Smartphone,
  Monitor
} from 'lucide-react';

const MOCK_TICKERS = {
  ASX: {
    TIER_3: [
      { ticker: 'FAU', name: 'First Au Ltd (ACTIVE)', price: 0.160, change: 6.7, conviction: 'C:9', rsi: 49.5, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'AUD', sector: 'Victorian Goldfields Exploration' },
      { ticker: 'UM1', name: 'Unity Metals Ltd (ACTIVE)', price: 0.110, change: 4.8, conviction: 'C:8', rsi: 46.2, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'AUD', sector: 'Base & Precious Metals' },
      { ticker: 'SCP', name: 'Scalare Partners Holdings Ltd', price: 4.84, change: 0.0, conviction: 'C:10', rsi: 50.1, macd: 'FLAT', obv: 'FLAT', currency: 'AUD', sector: 'Tech Investment / Dilution Veto' },
      { ticker: 'ARN', name: 'Aldoro Resources Limited', price: 0.340, change: 5.2, conviction: 'C:7', rsi: 45.8, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'AUD', sector: 'Lithium & Rubidium Exploration' }
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
      { ticker: 'NST', name: 'Northern Star Resources', price: 25.65, change: 3.8, conviction: 'C:9', rsi: 55.4, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'AUD', sector: 'Tier-1 Gold Producer (Hemi Acquired)' },
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

// Helper: resolve initial tab from URL pathname or hash
const resolveInitialTab = () => {
  try {
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      if (path === '/setup' || hash === '#/setup' || hash === '#setup') {
        return 'FLEET_SETUP';
      }
    }
  } catch (e) {}
  return 'SCANNER';
};

export default function App() {
  // 1. Primary View State Declarations
  const [activeMainTab, setActiveMainTab] = useState(resolveInitialTab);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('titan_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeExchange, setActiveExchange] = useState('ASX');
  const [activeTier, setActiveTier] = useState('TIER_3');
  const [activePersona, setActivePersona] = useState('GEOLOGIST');
  const [exchangeData, setExchangeData] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [isFinTechProOpen, setIsFinTechProOpen] = useState(false);
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isRunwayOpen, setIsRunwayOpen] = useState(false);
  const [stagedNotification, setStagedNotification] = useState(null);

  // Workspace Layout Mode: 'COCKPIT' (Admin Pro) vs. 'STANDARD' (Retail Multi-Tab)
  const [cockpitSubView, setCockpitSubView] = useState('PRO_GRID');
  const [layoutMode, setLayoutMode] = useState(() => {
    try {
      return localStorage.getItem('titan_layout_mode') || 'STANDARD';
    } catch (e) {
      return 'STANDARD';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('titan_theme', nextTheme);
    } catch (e) {}
  };

  const isLight = theme === 'light';
  const isMobileMode = layoutMode === 'MOBILE';

  // Enforce Mobile Phone Mode restriction: strictly Analytics & Trade screens only
  useEffect(() => {
    if (layoutMode === 'MOBILE' && activeMainTab === 'FLEET_SETUP') {
      setActiveMainTab('SCANNER');
    }
  }, [layoutMode, activeMainTab]);

  // 2. Sync URL history on navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = (window.location.pathname || '').toLowerCase();
        const hash = (window.location.hash || '').toLowerCase();
        if (layoutMode !== 'MOBILE' && (path === '/setup' || hash === '#/setup' || hash === '#setup')) {
          setActiveMainTab('FLEET_SETUP');
        } else if (activeMainTab === 'FLEET_SETUP') {
          setActiveMainTab('SCANNER');
        }
      } catch (e) {}
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    const handleCockpitMessage = (event) => {
      if (
        event.origin === 'https://asx-quant-brain.onrender.com' &&
        event.data?.type === 'TITAN_EXIT_COCKPIT'
      ) {
        setLayoutMode('STANDARD');
        try {
          localStorage.setItem('titan_layout_mode', 'STANDARD');
        } catch (e) {}
      }
    };
    window.addEventListener('message', handleCockpitMessage);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('message', handleCockpitMessage);
    };
  }, [activeMainTab, layoutMode]);

  // User session with persistent localStorage authentication (requires cryptographic idToken + non-expired JWT)
  const [userSession, setUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem('titan_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.idToken && parsed.isAuthed) {
          // Check if JWT is expired (e.g., old 1-hour Google OAuth token from previous build)
          let isExpired = false;
          try {
            const parts = String(parsed.idToken).split('.');
            if (parts.length === 3) {
              const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(atob(base64));
              if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
                isExpired = true;
              }
            }
          } catch (jwtErr) {}
          if (!isExpired) {
            return parsed;
          }
        }
        // Purge any legacy or expired session so user sees the Main Login Screen & Mode Switch
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
  if (!userSession?.isAuthed) {
    return (
      <InstitutionalGateAndSetupWizard
        userSession={userSession}
        onLoginSuccess={handleLoginSuccess}
        onCompleteSetup={handleCompleteSetup}
        onLogout={handleLogout}
        layoutMode={layoutMode}
        onSelectLayoutMode={setLayoutMode}
      />
    );
  }

  const currentExMeta = exchangeData?.[activeExchange] || {};
  const isExtendedHours = currentExMeta.session_phase === 'PRE_MARKET' || currentExMeta.session_phase === 'AFTER_HOURS';
  const tickerList = MOCK_TICKERS[activeExchange]?.[activeTier] || [];

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-black transition-colors duration-200 ${isMobileMode ? 'pb-16' : ''} ${isLight ? "bg-slate-50 text-slate-900" : "bg-[#0a0e17] text-slate-100"}`}>

      {/* 1. Dual-Clock World Exchange Telemetry Bar */}
      <DualClockTelemetryBar
        activeExchange={activeExchange}
        exchangeData={exchangeData}
        tenantId={userSession?.tenantId || 'ADMIN-SOVEREIGN-NODE'}
        onRefresh={fetchExchangeStatus}
      />

      {/* 2. Top Portal Header */}
      <header className={`border-b px-4 py-3 sticky top-0 z-40 backdrop-blur transition-colors duration-200 ${isLight ? "bg-white/95 border-slate-200 shadow-sm" : "bg-[#111827] border-slate-800"}`}>

        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950 font-bold text-slate-950">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`font-bold text-base tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  TITAN <span className="text-emerald-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">SAAS V2</span>
                </h1>
                {isMobileMode ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <Smartphone className="w-3 h-3 text-cyan-400" />
                    MOBILE MODE: ANALYTICS &amp; TRADE ONLY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    AUTHENTICATED FLEET: {userSession?.name || 'Authorized Fleet'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Intuitive Enclave Navigation & Setup Dropdown Menu */}
            <EnclaveDropdownMenu
              activeMainTab={activeMainTab}
              onSelectTab={setActiveMainTab}
              layoutMode={layoutMode}
              onToggleLayoutMode={setLayoutMode}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenBacktest={() => setIsBacktestOpen(true)}
              theme={theme}
            />

            {/* Sequenced Trading Action Runway Launch Button */}
            <button
              onClick={() => setIsRunwayOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30 shadow-emerald-950/20"
              title="Launch Sequenced 4-Step Trading Action Runway"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">Action Runway</span>
            </button>

            {/* Direct Dedicated Setup Hub Button (Hidden in Mobile Phone Mode) */}
            {!isMobileMode && (
              <button
                onClick={() => setShowSetupModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  showSetupModal
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/10'
                    : isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Open Dedicated Fleet Setup & Workbook Wizard (Pop-Up Modal)"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Setup Hub</span>
              </button>
            )}

            {/* Workspace Layout Mode Toggle: Webpage (Standard) vs. Mobile (Trade/Analytics) vs. Cockpit (Pro) */}
            <div className="flex items-center bg-[#070c12] p-0.5 rounded-lg border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setLayoutMode('STANDARD');
                  try { localStorage.setItem('titan_layout_mode', 'STANDARD'); } catch(e) {}
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-bold transition ${
                  layoutMode === 'STANDARD'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full Webpage Mode (Complete Enclave, Google Sheets Auto-Builder & Multi-Tab Desk)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="inline">Webpage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLayoutMode('MOBILE');
                  if (activeMainTab === 'FLEET_SETUP') setActiveMainTab('SCANNER');
                  try { localStorage.setItem('titan_layout_mode', 'MOBILE'); } catch(e) {}
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-bold transition ${
                  layoutMode === 'MOBILE'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile Phone Mode (Limited Display: Analytics & Trade Screens Only)"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="inline">Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLayoutMode('COCKPIT');
                  try { localStorage.setItem('titan_layout_mode', 'COCKPIT'); } catch(e) {}
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-bold transition ${
                  layoutMode === 'COCKPIT'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="TITAN V156 Dashboard - Quant Cockpit (https://asx-quant-brain.onrender.com/ui)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="inline">Cockpit (Pro)</span>
              </button>
            </div>

            {/* Institutional Help & Quick Guide (Hidden in Mobile Phone Mode to save space) */}
            {!isMobileMode && (
              <button
                onClick={() => setIsGuideOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  isLight 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                }`}
                title="Open Institutional User Guide"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guide</span>
              </button>
            )}

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                isLight 
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' 
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isLight ? "Switch to Obsidian Dark Mode" : "Switch to Swiss Crisp Light Mode"}
            >
              {isLight ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
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

      {/* 3. Primary App Navigation Bar (Hidden when Cockpit Pro is Active) */}
      {layoutMode !== 'COCKPIT' && (
      <nav className={`border-b px-4 transition-colors duration-200 ${isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"}`}>

        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveMainTab('SCANNER')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shrink-0 ${
                activeMainTab === 'SCANNER'
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{isMobileMode ? 'Trade & Signals' : 'Markets & Scanner'}</span>
            </button>

            <button
              onClick={() => setActiveMainTab('PORTFOLIO')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shrink-0 ${
                activeMainTab === 'PORTFOLIO'
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{isMobileMode ? 'Portfolio & Analytics' : 'My Portfolio & Holdings'}</span>
            </button>

            <button
              onClick={() => setActiveMainTab('AI_TERMINAL')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shrink-0 ${
                activeMainTab === 'AI_TERMINAL'
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Analyst Terminal</span>
            </button>

            {!isMobileMode && (
              <button
                onClick={() => {
                  setActiveMainTab('FLEET_SETUP');
                  try { window.history.pushState(null, '', '/setup'); } catch(e) {}
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  activeMainTab === 'FLEET_SETUP'
                    ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Fleet & Setup</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Enclave</span>
              </button>
            )}

            <button
              onClick={() => setIsBacktestOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition shrink-0"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Backtest Lab</span>
            </button>

          </div>

          {isMobileMode && (
            <button
              type="button"
              onClick={() => {
                setLayoutMode('STANDARD');
                try { localStorage.setItem('titan_layout_mode', 'STANDARD'); } catch (e) {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[11px] font-mono font-bold transition shrink-0"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Switch to Full Webpage</span>
            </button>
          )}
        </div>
      </nav>
      )}

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
        <main className="w-full flex-1 flex flex-col bg-[#070b12]">
          {/* Cockpit Sub-Bar */}
          <div className="bg-[#0b1320] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">
                  TITAN V156 Dashboard — Quant Cockpit
                </span>
                <span className="hidden md:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                  Target: https://asx-quant-brain.onrender.com/ui
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Primary Sequenced Trading Runway Action Trigger */}
              <button
                type="button"
                onClick={() => setIsRunwayOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-mono font-extrabold shadow-md transition"
                title="Launch 4-Step Sequenced Trade Execution Runway"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Start Trading Runway (4-Step)</span>
              </button>

              {/* Cockpit Mode Toggle (Native V156 Cockpit vs High-Density React Grid) */}
              <div className="bg-[#080d14] p-0.5 rounded-lg border border-slate-800 flex items-center text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setCockpitSubView('V156_NATIVE')}
                  className={`px-2.5 py-1 rounded transition ${
                    cockpitSubView === 'V156_NATIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Direct Native V156 Backend Cockpit Dashboard"
                >
                  Native V156 UI
                </button>
                <button
                  type="button"
                  onClick={() => setCockpitSubView('PRO_GRID')}
                  className={`px-2.5 py-1 rounded transition ${
                    cockpitSubView === 'PRO_GRID'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="High-Density React Grid Cockpit"
                >
                  React Grid
                </button>
              </div>

              {/* Refresh Iframe button */}
              {cockpitSubView === 'V156_NATIVE' && (
                <button
                  type="button"
                  onClick={() => {
                    const iframe = document.getElementById('titan-v156-iframe');
                    if (iframe) iframe.src = iframe.src;
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition border border-slate-700"
                  title="Reload Backend Quant Cockpit Telemetry"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              )}

              {/* Direct Fullscreen / External Window Popout */}
              <a
                href={`https://asx-quant-brain.onrender.com/ui?token=${encodeURIComponent(userSession?.idToken || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition"
                title="Launch TITAN V156 Dashboard in Fullscreen Browser Tab"
              >
                <span>Launch Fullscreen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Body */}
          {cockpitSubView === 'V156_NATIVE' ? (
            <div className="w-full flex-1 relative bg-[#080d14]" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <iframe
                id="titan-v156-iframe"
                src={`https://asx-quant-brain.onrender.com/ui?token=${encodeURIComponent(userSession?.idToken || '')}`}
                title="TITAN V156 Dashboard - Quant Cockpit"
                className="w-full h-full border-0"
                style={{ minHeight: 'calc(100vh - 120px)' }}
                allow="clipboard-read; clipboard-write; fullscreen"
              />
            </div>
          ) : (
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
              onLogout={handleLogout}
            />
          )}
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
                  className={`text-left p-2.5 rounded-xl border transition-all duration-150 shadow-sm ${
                    activePersona === p.id
                      ? isLight ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-emerald-500/10' : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : isLight ? 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80' : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-700'
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
            theme={theme}
            counts={{
              TIER_3: MOCK_TICKERS[activeExchange]?.TIER_3?.length || 0,
              TIER_1: MOCK_TICKERS[activeExchange]?.TIER_1?.length || 0,
              TIER_2: MOCK_TICKERS[activeExchange]?.TIER_2?.length || 0,
              POI_SNIPER: MOCK_TICKERS[activeExchange]?.POI_SNIPER?.length || 0
            }}
          />

          {/* Asset Scanner Table / Mobile Trade Signal Cards */}
          <div className={`border rounded-2xl overflow-hidden shadow-xl transition-colors duration-200 ${isLight ? "bg-white border-slate-200 shadow-slate-200/60" : "bg-[#111827] border-slate-800 shadow-black/40"}`}>

            <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-2 ${isLight ? "bg-slate-50/90 border-slate-200 text-slate-900" : "bg-[#131b2e] border-slate-800 text-slate-100"}`}>

              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{activeExchange} {activeTier.replace('_', ' ')} Watchlist</span>
                  <span className="text-xs font-normal text-slate-400">({tickerList.length} assets active)</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Vectorized RSI (14), EMA Cross &amp; MACD Real-Time Telemetry
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isMobileMode && (
                  <button
                    onClick={() => setIsRunwayOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-lg transition shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Trade Runway</span>
                  </button>
                )}
                <button
                  onClick={() => setIsBacktestOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simulate Strategy</span>
                </button>
              </div>
            </div>

            {isMobileMode ? (
              <div className="p-3 space-y-3 font-mono text-xs">
                {tickerList.map((item) => (
                  <div
                    key={`mob-scan-${item.ticker}`}
                    onClick={() => setSelectedTicker(item)}
                    className={`rounded-xl border p-3.5 cursor-pointer transition space-y-2.5 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                        : 'bg-[#0b1220] border-slate-800 hover:border-emerald-500/40 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold text-sm">{item.ticker}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                            {item.conviction}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                          {item.name} • {item.sector}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">
                          {item.currency} ${item.price.toFixed(item.price < 1 ? 4 : 2)}
                        </div>
                        <div className={`text-[11px] font-bold inline-flex items-center gap-0.5 ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[10px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400">
                          RSI: <strong className={item.rsi < 40 ? 'text-emerald-400' : item.rsi > 70 ? 'text-rose-400' : 'text-slate-200'}>{item.rsi.toFixed(1)}</strong>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          item.macd === 'BULLISH_HOOK'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.macd}
                        </span>
                        <span className={item.obv === 'SURGING' ? 'text-cyan-400 font-bold' : 'text-emerald-300'}>
                          OBV: {item.obv}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicker(item);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition shrink-0 shadow-sm"
                      >
                        ⚡ Trade / Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className={`text-[10px] uppercase tracking-wider border-b ${isLight ? "bg-slate-100/90 text-slate-600 border-slate-200" : "bg-[#0f172a] text-slate-400 border-slate-800"}`}>
                  <tr>
                    <th className="py-3 px-4">Symbol / Name</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4 text-right">
                      Price <HelpTooltip title="Price" text="Signal price with Rule 24 (+2% marketable limit cap) enforced." theme={theme} />
                    </th>
                    <th className="py-3 px-4 text-right">Change</th>
                    <th className="py-3 px-4 text-center">
                      Score <HelpTooltip title="Conviction Score" text="1-10 rating evaluating Volatility Compression (NR7), Chaikin Flow, and MACD slope." theme={theme} />
                    </th>
                    <th className="py-3 px-4">
                      RSI (14) <HelpTooltip title="RSI Velocity" text="Relative Strength Index: Values below 40 denote deep compression; above 70 denote power thrust." theme={theme} />
                    </th>
                    <th className="py-3 px-4">
                      MACD Hook <HelpTooltip title="MACD Slope" text="Bullish Kinematic Hook: Confirms momentum vector slope expansion (> 0)." theme={theme} />
                    </th>
                    <th className="py-3 px-4">
                      Volume OBV <HelpTooltip title="On-Balance Volume" text="Confirms institutional accumulation prior to retail breakout." theme={theme} />
                    </th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-slate-800/60"}`}>

                  {tickerList.map((item) => (
                    <tr
                      key={item.ticker}
                      onClick={() => setSelectedTicker(item)}
                      className={`cursor-pointer transition-colors duration-150 ${isLight ? "hover:bg-slate-50/90 text-slate-900" : "hover:bg-slate-800/40 text-slate-100"}`}
                    >
                      <td className="py-3 px-4 font-bold">
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
            )}
          </div>
        </main>
      )}

      {/* TAB 2: PORTFOLIO HOLDINGS */}
      {activeMainTab === 'PORTFOLIO' && (
        <PortfolioHoldingsView
          userSession={userSession}
          theme={theme}
          isMobileMode={isMobileMode}
          onNavigateToFleetSetup={
            isMobileMode
              ? undefined
              : () => {
                  setActiveMainTab('FLEET_SETUP');
                  try { window.history.pushState(null, '', '/setup'); } catch(e) {}
                }
          }
          onUpdateSession={(updated) => {
            setUserSession(updated);
            try { localStorage.setItem('titan_user_session', JSON.stringify(updated)); } catch(e) {}
          }}
          onSelectTicker={(t) => {
            setSelectedTicker({
              ...t,
              ticker: t.ticker,
              name: t.name || t.company || t.ticker,
              price: t.price ?? t.livePrice ?? 0,
              change: t.plPct ?? t.change ?? 0,
              conviction: t.conviction || 'C:9',
              currency: t.currency || userSession?.currency || 'AUD'
            });
          }}
        />
      )}

      {/* TAB: FLEET COMMAND & ENCLAVE SETUP (Strictly Hidden in Mobile Phone Mode) */}
      {!isMobileMode && activeMainTab === 'FLEET_SETUP' && (
        <FleetSetupView
          userSession={userSession}
          theme={theme}
          onOpenFinTechPro={() => setIsFinTechProOpen(true)}
          onUpdateSession={(updated) => {
            setUserSession(updated);
            try { localStorage.setItem('titan_user_session', JSON.stringify(updated)); } catch(e) {}
          }}
          onOpenBacktest={() => setIsBacktestOpen(true)}
          onOpenScanner={() => setActiveMainTab('SCANNER')}
        />
      )}

      {/* TAB 3: AI ANALYST TERMINAL */}
      {activeMainTab === 'AI_TERMINAL' && (
        <AIAnalystTerminalView
          userSession={userSession}
          activeExchange={activeExchange}
          theme={theme}
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

      {/* Fixed Bottom Mobile Phone Navigation Bar (Analytics, Trade, Pro Display & Webpage Switch) */}
      <div className={`${isMobileMode ? 'block' : 'sm:hidden'} fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 backdrop-blur-md shadow-2xl ${
        isLight ? 'bg-white/95 border-slate-200' : 'bg-[#090e17]/95 border-slate-800'
      }`}>
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => {
              if (layoutMode === 'COCKPIT') setLayoutMode('MOBILE');
              setActiveMainTab('SCANNER');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl font-bold transition ${
              layoutMode !== 'COCKPIT' && activeMainTab === 'SCANNER'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mb-0.5" />
            <span>Trade</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (layoutMode === 'COCKPIT') setLayoutMode('MOBILE');
              setActiveMainTab('PORTFOLIO');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl font-bold transition ${
              layoutMode !== 'COCKPIT' && activeMainTab === 'PORTFOLIO'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span>Portfolio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (layoutMode === 'COCKPIT') setLayoutMode('MOBILE');
              setActiveMainTab('AI_TERMINAL');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl font-bold transition ${
              layoutMode !== 'COCKPIT' && activeMainTab === 'AI_TERMINAL'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 mb-0.5" />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLayoutMode('COCKPIT');
              try { localStorage.setItem('titan_layout_mode', 'COCKPIT'); } catch (e) {}
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl font-bold transition ${
              layoutMode === 'COCKPIT'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 mb-0.5" />
            <span>Pro Display</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextMode = layoutMode === 'MOBILE' ? 'STANDARD' : 'MOBILE';
              setLayoutMode(nextMode);
              try { localStorage.setItem('titan_layout_mode', nextMode); } catch (e) {}
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition"
          >
            {layoutMode === 'MOBILE' ? <Monitor className="w-4 h-4 mb-0.5" /> : <Smartphone className="w-4 h-4 mb-0.5" />}
            <span>{layoutMode === 'MOBILE' ? 'Webpage' : 'Mobile'}</span>
          </button>
        </div>
      </div>

      {/* Footer with ASIC Statutory Disclaimer */}
      <footer className="bg-[#0f172a] border-t border-slate-800/80 px-4 py-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">TITAN QUANTITATIVE SYSTEMS</span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                AUTHENTICATED FLEET: {userSession?.name || 'Authorized Fleet'}
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
        userEquity={userSession?.startingCapital || 25000}
        userSession={userSession}
        theme={theme}
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

      {/* Institutional Guided Tour & Help Modal */}
      <GuidedTourModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        theme={theme}
      />

      {/* Sequenced Trading Action Runway Modal */}
      <SequencedTradingRunwayModal
        isOpen={isRunwayOpen}
        onClose={() => setIsRunwayOpen(false)}
        activeExchange={activeExchange}
        exchangeData={exchangeData}
        userSession={userSession}
        onStageOrder={(order) => {
          handleStageOrder(order);
          setStagedNotification(order);
        }}
        theme={theme}
      />
    </div>
  );
}
