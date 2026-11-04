import React, { useState, useEffect } from 'react';
import DualClockTelemetryBar from './components/DualClockTelemetryBar';
import ExchangeSwitcherTabs from './components/ExchangeSwitcherTabs';
import UniversalTierSelector from './components/UniversalTierSelector';
import InteractiveKinematicDrawer from './components/InteractiveKinematicDrawer';
import FinTechProSuiteModal from './components/FinTechProSuiteModal';
import CustomerAuthModal from './components/CustomerAuthModal';
import BacktestLabModal from './components/BacktestLabModal';
import PortfolioHoldingsView from './components/PortfolioHoldingsView';
import AIAnalystTerminalView from './components/AIAnalystTerminalView';
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  User, 
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
      { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 142.50, change: 2.4, conviction: 'C:10', rsi: 61.2, macd: 'EXPANDING', obv: 'SURGING', currency: 'USD', sector: 'Accelerated Computing' },
      { ticker: 'MSFT', name: 'Microsoft Corporation', price: 428.10, change: 0.6, conviction: 'C:10', rsi: 54.0, macd: 'CONSOLIDATING', obv: 'NEUTRAL', currency: 'USD', sector: 'Enterprise Cloud & AI' },
      { ticker: 'AAPL', name: 'Apple Inc', price: 228.40, change: -0.3, conviction: 'C:9', rsi: 49.5, macd: 'STABLE', obv: 'NEUTRAL', currency: 'USD', sector: 'Consumer Hardware' }
    ],
    TIER_2: [
      { ticker: 'PLTR', name: 'Palantir Technologies', price: 44.80, change: 5.6, conviction: 'C:9', rsi: 63.8, macd: 'EXPANDING', obv: 'SURGING', currency: 'USD', sector: 'Defense AIP Software' },
      { ticker: 'APP', name: 'AppLovin Corporation', price: 285.40, change: 8.9, conviction: 'C:9', rsi: 68.2, macd: 'MOMENTUM', obv: 'SURGING', currency: 'USD', sector: 'AI Ad Optimization' }
    ],
    POI_SNIPER: [
      { ticker: 'RKLB', name: 'Rocket Lab USA Inc', price: 15.60, change: 12.4, conviction: 'C:9', rsi: 48.0, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'USD', sector: 'Neutron Launch Vehicle' }
    ]
  },
  LSE: {
    TIER_3: [
      { ticker: 'PREM', name: 'Premier African Minerals', price: 0.048, change: 18.5, conviction: 'C:8', rsi: 39.5, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'GBP', sector: 'Zulu Lithium Project' }
    ],
    TIER_1: [
      { ticker: 'AZN', name: 'AstraZeneca PLC', price: 104.20, change: 1.1, conviction: 'C:10', rsi: 47.8, macd: 'STABLE', obv: 'NEUTRAL', currency: 'GBP', sector: 'Oncology Pharmaceuticals' }
    ],
    TIER_2: [
      { ticker: 'RR', name: 'Rolls-Royce Holdings', price: 5.65, change: 3.4, conviction: 'C:9', rsi: 62.1, macd: 'EXPANDING', obv: 'SURGING', currency: 'GBP', sector: 'Defense & Aerospace Power' }
    ],
    POI_SNIPER: [
      { ticker: 'KOD', name: 'Kodal Minerals PLC', price: 0.42, change: 4.8, conviction: 'C:8', rsi: 43.2, macd: 'BULLISH_HOOK', obv: 'ACCUMULATING', currency: 'GBP', sector: 'Bougouni Lithium' }
    ]
  },
  TSX: {
    TIER_3: [
      { ticker: 'PMET', name: 'Patriot Battery Metals', price: 3.45, change: 8.2, conviction: 'C:8', rsi: 42.0, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'CAD', sector: 'Shaakichiuwaana Lithium' }
    ],
    TIER_1: [
      { ticker: 'ABX', name: 'Barrick Gold Corp', price: 24.80, change: 1.5, conviction: 'C:10', rsi: 54.0, macd: 'STABLE', obv: 'NEUTRAL', currency: 'CAD', sector: 'Tier 1 Gold Mining' }
    ],
    TIER_2: [
      { ticker: 'LUN', name: 'Lundin Mining Corp', price: 14.20, change: 3.1, conviction: 'C:9', rsi: 57.5, macd: 'EXPANDING', obv: 'ACCUMULATING', currency: 'CAD', sector: 'Copper / Zinc Production' }
    ],
    POI_SNIPER: [
      { ticker: 'ISO', name: 'IsoEnergy Ltd', price: 4.10, change: 6.4, conviction: 'C:9', rsi: 46.2, macd: 'BULLISH_HOOK', obv: 'SURGING', currency: 'CAD', sector: 'Athabasca Basin Uranium' }
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);
  const [userSession, setUserSession] = useState({
    name: 'Demonstration Quant Node',
    email: 'demo@titanquant.com',
    isAuthed: false,
    currency: 'AUD'
  });
  const [stagedNotification, setStagedNotification] = useState(null);

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
    setUserSession(session);
    setActiveMainTab('PORTFOLIO'); // Automatically take the user to their portfolio upon logging in
  };

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
                {userSession.isAuthed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    AUTHENTICATED NODE
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    <FlaskConical className="w-3 h-3 text-cyan-400" />
                    PUBLIC DEMO SANDBOX
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* FinTech Pro Add-On Toggle */}
            <button
              onClick={() => setIsFinTechProOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>FinTech Pro</span>
            </button>

            {/* Tenant Auth Wall */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                userSession.isAuthed
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${userSession.isAuthed ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{userSession.isAuthed ? userSession.name : 'Sign In / Connect Node'}</span>
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
              <span>My Portfolio & Fleet</span>
              {userSession.isAuthed && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveMainTab('AI_TERMINAL')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'AI_TERMINAL'
                  ? 'bg-purple-500/15 text-purple-300 border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>AI Analyst Terminal</span>
            </button>

            <button
              onClick={() => setIsBacktestOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/20 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>5-Year Backtest Lab</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 pr-2">
            <span>Node:</span>
            <span className="text-slate-200 font-bold">{userSession.isAuthed ? userSession.name : 'Demo Sandbox'}</span>
          </div>
        </div>
      </nav>

      {/* Public Demonstration & Paper Sandbox Banner (if not authenticated) */}
      {!userSession.isAuthed && (
        <div className="bg-cyan-950/40 border-b border-cyan-800/60 px-4 py-2 text-xs text-cyan-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              <span>
                <strong>PUBLIC DEMONSTRATION & PAPER SANDBOX:</strong> You are viewing an interactive institutional quant simulation. Click <strong>"Sign In / Connect Node"</strong> to view real connected workbooks.
              </span>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-[10px] font-mono bg-cyan-900/80 hover:bg-cyan-800 text-cyan-100 px-2.5 py-1 rounded border border-cyan-700 whitespace-nowrap self-start sm:self-auto transition font-bold"
            >
              CONNECT LIVE FLEET →
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: MARKETS & SCANNER */}
      {activeMainTab === 'SCANNER' && (
        <>
          {/* Exchange Switcher Tabs */}
          <ExchangeSwitcherTabs
            activeExchange={activeExchange}
            onSelectExchange={setActiveExchange}
            exchangeData={exchangeData}
          />

          {/* Extended Hours & Wide Spread Banner */}
          {isExtendedHours && (
            <div className="bg-amber-950/40 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-300">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>
                    <strong>EXTENDED TRADING HOURS ACTIVE:</strong> {currentExMeta.name} is in {currentExMeta.session_phase}. Wider bid-ask spreads apply. 2% chase limit strictly enforced.
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">
                  LOW LIQUIDITY SHIELD
                </span>
              </div>
            </div>
          )}

          {/* AI Persona Selector Strip */}
          <div className="bg-[#111827]/60 border-b border-slate-800 px-4 py-2 text-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active AI Sector Persona:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    title={p.desc}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      activePersona === p.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Universal Asset Tier Selectors */}
          <UniversalTierSelector
            activeTier={activeTier}
            onSelectTier={setActiveTier}
            activeExchange={activeExchange}
          />

          {/* Staged Order Toast Notification */}
          {stagedNotification && (
            <div className="max-w-7xl mx-auto px-4 w-full mb-3">
              <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200 shadow-xl backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>
                    <strong>SIMULATED ORDER STAGED (PAPER SANDBOX):</strong> {stagedNotification.ticker} limit at {stagedNotification.currency === 'USD' ? '$' : 'A$'}{stagedNotification.price} (2% chase limit enforced).
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                  STAGED ID: 9f8a-4b21
                </span>
              </div>
            </div>
          )}

          {/* Main Ticker Scanner Feed */}
          <main className="max-w-7xl mx-auto px-4 flex-1 w-full pb-12">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151d30]">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{activeExchange} Active Candidates</span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {tickerList.length} Qualified
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filtered via 14-day volatility compression, Wilder's RSI, and Rule 53 OBV Divergence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Chase Tolerance: <strong className="text-emerald-400">2.0% Max</strong>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f172a] text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 font-semibold">Ticker / Asset</th>
                      <th className="p-3.5 font-semibold">Live Price</th>
                      <th className="p-3.5 font-semibold">24h Chg</th>
                      <th className="p-3.5 font-semibold">Conviction</th>
                      <th className="p-3.5 font-semibold">RSI (14)</th>
                      <th className="p-3.5 font-semibold">Kinematic Vector</th>
                      <th className="p-3.5 font-semibold">Stealth OBV</th>
                      <th className="p-3.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {tickerList.map((row) => {
                      const isPositive = row.change >= 0;

                      return (
                        <tr
                          key={row.ticker}
                          onClick={() => setSelectedTicker(row)}
                          className="hover:bg-slate-800/40 cursor-pointer transition"
                        >
                          <td className="p-3.5">
                            <div className="font-bold text-slate-100 text-sm">{row.ticker}</div>
                            <div className="text-[11px] text-slate-400 font-sans">{row.name}</div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-100 text-sm">
                            {row.currency === 'USD' ? '$' : 'A$'}{row.price.toFixed(row.price < 1 ? 3 : 2)}
                          </td>
                          <td className="p-3.5 font-semibold">
                            <span className={`inline-flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {isPositive ? '+' : ''}{row.change}%
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {row.conviction}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300">
                            {row.rsi}
                          </td>
                          <td className="p-3.5">
                            <span className="text-cyan-400 text-[11px]">
                              {row.macd}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`text-[11px] font-semibold ${
                              row.obv === 'SURGING' ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              {row.obv}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicker(row);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1 transition"
                            >
                              <span>Analyze</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </>
      )}

      {/* TAB 2: MY PORTFOLIO & CONNECTED FLEET */}
      {activeMainTab === 'PORTFOLIO' && (
        <PortfolioHoldingsView
          onSelectTicker={(ticker) => {
            const found = tickerList.find((t) => t.ticker === ticker) || {
              ticker,
              name: ticker,
              price: 14.50,
              conviction: 'C:9',
              currency: 'AUD'
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

      {/* Footer with ASIC Statutory Disclaimer */}
      <footer className="bg-[#0f172a] border-t border-slate-800/80 px-4 py-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">TITAN QUANTITATIVE SYSTEMS</span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {userSession.isAuthed ? `AUTHENTICATED FLEET: ${userSession.name}` : 'PUBLIC DEMONSTRATION & PAPER SANDBOX'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Engine: TITAN V2 Multi-Tenant • Sydney / Wall St Gateway
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            <strong>ASIC Statutory Disclaimer:</strong> This system is an automated algorithmic research, demonstration, and risk-management tool. It does not constitute personal financial product advice, investment advice, or a recommendation to acquire any financial product. All simulated paper order executions, backtest results, and capital allocation models are for quantitative demonstration purposes only. Past quantitative performance is not a reliable indicator of future market returns.
          </p>
        </div>
      </footer>

      {/* Interactive Kinematic Drawer */}
      <InteractiveKinematicDrawer
        ticker={selectedTicker?.ticker}
        data={selectedTicker}
        onClose={() => setSelectedTicker(null)}
        onExecuteOrder={handleStageOrder}
      />

      {/* FinTech Pro Add-On Modal */}
      <FinTechProSuiteModal
        isOpen={isFinTechProOpen}
        onClose={() => setIsFinTechProOpen(false)}
      />

      {/* Customer OAuth / Tenant Login Modal */}
      <CustomerAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        userSession={userSession}
        onLoginSuccess={handleLoginSuccess}
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
