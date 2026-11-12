import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Database,
  RefreshCw,
  Sliders,
  PlusCircle,
  Cpu,
  Settings2,
  Rocket,
  Activity,
  Zap,
  Clock,
  FlaskConical,
  AlertTriangle,
  ChevronRight,
  Filter,
  BarChart3,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import WorkbookAutoBuilderModal from './WorkbookAutoBuilderModal';
import SignalInceptionView, { formatVerifiedVolMult, computeDaysSince } from './SignalInceptionView';
import { resolveAntiChurnShield } from './PortfolioHoldingsView';

const API_BASE = 'https://asx-quant-brain.onrender.com';

const DEFAULT_ADMIN_WORKBOOKS = [
  {
    id: 'ALL',
    name: 'All 5 Fleet Workbooks (Consolidated)',
    exchange: 'GLOBAL',
    currency: 'AUD',
    strategy_protocol: 'MULTI_STRATEGY_FLEET',
    sector_persona: 'MOONSHOT_COILED_HUNTER',
    execution_mode: 'AUTONOMOUS',
    equity: 92420.00,
    cash: 59150.00,
    starting_capital: 80000.00,
    openPositions: 7,
    dayPl: 1485.00,
    dayPlPct: 1.63
  },
  {
    id: 'ai-trader-workbook',
    name: 'AI_TRADER_WORKBOOK (Primary ASX Node)',
    exchange: 'ASX',
    currency: 'AUD',
    strategy_protocol: 'MOONSHOT_COILED_SPRING',
    sector_persona: 'MOONSHOT_COILED_HUNTER',
    execution_mode: 'AUTONOMOUS',
    equity: 11250.00,
    cash: 7450.00,
    starting_capital: 10000.00,
    openPositions: 2,
    dayPl: 225.00,
    dayPlPct: 2.04
  },
  {
    id: 'pennymines-workbook',
    name: 'PENNYMINES_WORKBOOK (Tier-3 Speculative)',
    exchange: 'ASX',
    currency: 'AUD',
    strategy_protocol: 'MOONSHOT_COILED_SPRING',
    sector_persona: 'JUNIOR_MINING_SPECULATOR',
    execution_mode: 'AUTONOMOUS',
    equity: 21170.00,
    cash: 15220.00,
    starting_capital: 15000.00,
    openPositions: 1,
    dayPl: 410.00,
    dayPlPct: 1.97
  },
  {
    id: 'special-workbook',
    name: 'SPECIAL_WORKBOOK (Coiled Spring Sniper)',
    exchange: 'ASX',
    currency: 'AUD',
    strategy_protocol: 'MOONSHOT_COILED_SPRING',
    sector_persona: 'COILED_SPRING_SNIPER',
    execution_mode: 'AUTONOMOUS',
    equity: 15000.00,
    cash: 8480.00,
    starting_capital: 10000.00,
    openPositions: 2,
    dayPl: 190.00,
    dayPlPct: 1.27
  },
  {
    id: '100-asx-workbook',
    name: '100_ASX QUANT V125 (Bluechip Watchlist)',
    exchange: 'ASX',
    currency: 'AUD',
    strategy_protocol: 'BLUE_CHIP_CORE',
    sector_persona: 'FORTRESS_QUANT_OFFICER',
    execution_mode: 'AUTONOMOUS',
    equity: 25000.00,
    cash: 13800.00,
    starting_capital: 25000.00,
    openPositions: 1,
    dayPl: 370.00,
    dayPlPct: 1.48
  },
  {
    id: 'titan-us-workbook',
    name: 'Titan US Desk (Wall St Momentum)',
    exchange: 'NYSE',
    currency: 'USD',
    strategy_protocol: 'INTERNATIONAL_ALPHA',
    sector_persona: 'WALL_ST_MOMENTUM_TECH',
    execution_mode: 'AUTONOMOUS',
    equity: 20000.00,
    cash: 14200.00,
    starting_capital: 20000.00,
    openPositions: 1,
    dayPl: 290.00,
    dayPlPct: 1.45
  }
];

const DEFAULT_ADMIN_HOLDINGS = [
  { ticker: 'FAU', company: 'First Au Ltd', workbook: 'ai-trader-workbook', exchange: 'ASX', currency: 'AUD', units: 50000, avgCost: 0.140, livePrice: 0.160, marketValue: 8000.00, plDollar: 1000.00, plPct: 14.29, dayChangePct: 3.2, stopLoss: 0.135, status: 'ACTIVE', vol_mult: 2.1, vol_verified: true },
  { ticker: 'UM1', company: 'Unity Metals Ltd', workbook: 'ai-trader-workbook', exchange: 'ASX', currency: 'AUD', units: 65000, avgCost: 0.095, livePrice: 0.110, marketValue: 7150.00, plDollar: 975.00, plPct: 15.79, dayChangePct: 4.8, stopLoss: 0.088, status: 'ACTIVE', vol_mult: 2.4, vol_verified: true },
  { ticker: 'WIA', company: 'Wia Gold Limited', workbook: 'pennymines-workbook', exchange: 'ASX', currency: 'AUD', units: 110000, avgCost: 0.115, livePrice: 0.145, marketValue: 15950.00, plDollar: 3300.00, plPct: 26.09, dayChangePct: 5.1, stopLoss: 0.125, status: 'TRAILING_STOP', vol_mult: 2.8, vol_verified: true },
  { ticker: 'SXG', company: 'Southern Cross Gold', workbook: 'special-workbook', exchange: 'ASX', currency: 'AUD', units: 8500, avgCost: 2.65, livePrice: 3.10, marketValue: 26350.00, plDollar: 3825.00, plPct: 16.98, dayChangePct: 2.6, stopLoss: 2.75, status: 'COILED_HOLD', vol_mult: 1.9, vol_verified: true },
  { ticker: 'NST', company: 'Northern Star Resources Ltd', workbook: 'special-workbook', exchange: 'ASX', currency: 'AUD', units: 35, avgCost: 10.75, livePrice: 25.65, marketValue: 897.75, plDollar: 521.50, plPct: 138.60, dayChangePct: 1.8, stopLoss: 22.80, status: 'FREE_CARRY_ACTIVE', vol_mult: 1.7, vol_verified: true },
  { ticker: 'CSL', company: 'CSL Limited', workbook: '100-asx-workbook', exchange: 'ASX', currency: 'AUD', units: 115, avgCost: 284.00, livePrice: 298.50, marketValue: 34327.50, plDollar: 1667.50, plPct: 5.11, dayChangePct: 1.1, stopLoss: 272.00, status: 'FORTRESS_CORE', vol_mult: 1.5, vol_verified: true },
  { ticker: 'SOUN', company: 'SoundHound AI Inc', workbook: 'titan-us-workbook', exchange: 'NYSE', currency: 'USD', units: 4500, avgCost: 3.90, livePrice: 4.82, marketValue: 21690.00, plDollar: 4140.00, plPct: 23.59, dayChangePct: 6.4, stopLoss: 4.15, status: 'MOMENTUM_SURGE', vol_mult: 3.1, vol_verified: true }
];

export default function ProCockpitView({
  userSession,
  activeExchange,
  onSelectExchange,
  activeTier,
  onSelectTier,
  activePersona,
  onSelectPersona,
  tickerList = [],
  exchangeData = {},
  onSelectTicker,
  onOpenWorkbookBuilder,
  onOpenBacktest,
  stagedNotification,
  onStageOrder,
  onOpenAIAnalyst,
  onLogout
}) {
  const isAdminSession = Boolean(
    userSession?.isAdmin ||
    userSession?.role === 'SUPERADMIN' ||
    (userSession?.email || '').toLowerCase() === 'mrpswebster@gmail.com'
  );

  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [leftPaneTab, setLeftPaneTab] = useState('HOLDINGS'); // 'HOLDINGS' | 'INCEPTION'
  const [mobileCockpitPane, setMobileCockpitPane] = useState('HOLDINGS'); // 'HOLDINGS' | 'INCEPTION' | 'RADAR'
  const [workbooks, setWorkbooks] = useState(() => (isAdminSession ? DEFAULT_ADMIN_WORKBOOKS : []));
  const [holdings, setHoldings] = useState(() => (isAdminSession ? DEFAULT_ADMIN_HOLDINGS : []));
  const [accessTier, setAccessTier] = useState(() => (isAdminSession ? 'SUPERADMIN_FLEET' : 'ISOLATED_CLIENT_ENCLAVE'));
  const [loading, setLoading] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Auto-builder modal state inside cockpit
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingWorkbook, setEditingWorkbook] = useState(null);
  const [builderInitialTab, setBuilderInitialTab] = useState('WORKBOOK_BUILDER');

  const fetchFleetData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/portfolio/fleet`, {
        headers: {
          'Authorization': `Bearer ${userSession?.idToken || ''}`
        },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSessionExpiredNotice(false);
        if (Array.isArray(data.workbooks) && data.workbooks.length > 0) {
          setWorkbooks(data.workbooks);
        }
        if (Array.isArray(data.holdings)) {
          setHoldings(data.holdings.length > 0 || !isAdminSession ? data.holdings : DEFAULT_ADMIN_HOLDINGS);
        }
        setAccessTier(data.access_tier || (isAdminSession ? 'SUPERADMIN_FLEET' : 'ISOLATED_CLIENT_ENCLAVE'));
        if (data.workbooks?.length > 0 && selectedWorkbook === 'ALL' && data.access_tier !== 'SUPERADMIN_FLEET') {
          setSelectedWorkbook(data.workbooks[0].id);
        }
      } else if (res.status === 401) {
        setSessionExpiredNotice(true);
        if (isAdminSession && workbooks.length === 0) {
          setWorkbooks(DEFAULT_ADMIN_WORKBOOKS);
          setHoldings(DEFAULT_ADMIN_HOLDINGS);
          setAccessTier('SUPERADMIN_FLEET');
        }
      }
    } catch (e) {
      console.warn('Pro Cockpit fleet sync notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 30000);
    return () => clearInterval(interval);
  }, [userSession?.idToken, userSession?.startingCapital]);

  const fallbackSheet = {
    id: userSession?.spreadsheetId || 'CLIENT-SHEET',
    name: `${userSession?.name || 'Primary'} Node`,
    exchange: userSession?.currency || 'AUD',
    equity: userSession?.startingCapital || 25000,
    cash: userSession?.startingCapital || 25000,
    openPositions: 0,
    dayPl: 0,
    dayPlPct: 0
  };

  const activeWb = workbooks.find(w => w.id === selectedWorkbook) || workbooks[0] || fallbackSheet;
  const filteredHoldings = useMemo(() => {
    return selectedWorkbook === 'ALL'
      ? holdings
      : holdings.filter(h => h.workbook === selectedWorkbook);
  }, [holdings, selectedWorkbook]);

  const totalEquity = Number(activeWb.equity || userSession?.startingCapital || 25000);
  const totalCash = Number(activeWb.cash || userSession?.startingCapital || 25000);
  const investedValue = Math.max(0, totalEquity - totalCash);
  const curr = userSession?.currency || 'AUD';
  const exMeta = exchangeData?.[activeExchange] || {};

  // Compute Total Since-Purchase P&L across filtered holdings
  const totalSincePurchase = useMemo(() => {
    let cost = 0;
    let pl = 0;
    filteredHoldings.forEach((pos) => {
      const u = Number(pos.units || 0);
      const a = Number(pos.avgCost || 0);
      const l = Number(pos.livePrice || 0);
      const cb = Number(pos.costBasis || (u * a));
      const mv = Number(pos.marketValue || (u * l));
      cost += cb;
      pl += pos.plDollar !== undefined ? Number(pos.plDollar) : (mv - cb);
    });
    const pct = cost > 0 ? (pl / cost) * 100 : 0;
    return { plDollar: pl, plPct: pct };
  }, [filteredHoldings]);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-4 py-4 space-y-4 font-sans">
      {/* 1. TOP METRIC RIBBON (Westpac + Institutional Cockpit Style) */}
      <div className="bg-[#0d1520] border border-slate-800 rounded-xl p-3 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Workbook Selector & Node Identity */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                PRO COCKPIT
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                FLEET NODE
              </span>
            </div>

            {/* Workbook Selector Dropdown */}
            <select
              value={selectedWorkbook}
              onChange={(e) => setSelectedWorkbook(e.target.value)}
              className="bg-[#070c12] border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500 cursor-pointer"
            >
              {accessTier === 'SUPERADMIN_FLEET' && (
                <option value="ALL">🌐 ALL WORKBOOKS (Consolidated Fleet)</option>
              )}
              {workbooks.map(wb => (
                <option key={wb.id} value={wb.id}>
                  📁 {wb.name} ({wb.exchange || 'ASX'} • {wb.currency || curr} ${Number(wb.equity || 0).toLocaleString()})
                </option>
              ))}
              {workbooks.length === 0 && (
                <option value={fallbackSheet.id}>📁 {fallbackSheet.name}</option>
              )}
            </select>

            <button
              onClick={fetchFleetData}
              disabled={loading}
              className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition"
              title="Refresh Live Ledger"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>

          {/* Right: Quick Action Launchers (1-Click Google Sheets Auto-Builder & AI Hub) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingWorkbook(null);
                setBuilderInitialTab('WORKBOOK_BUILDER');
                setIsBuilderOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ New Workbook</span>
            </button>

            <button
              onClick={() => {
                setEditingWorkbook(null);
                setBuilderInitialTab('GLOBAL_AI_HUB');
                setIsBuilderOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-bold transition"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI &amp; MCP Config</span>
            </button>

            {onOpenBacktest && (
              <button
                onClick={onOpenBacktest}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition"
              >
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Backtest</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Density Key Financial Metrics Bar (6 Westpac Banking Strip Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
          <div className="bg-[#070c12] p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Total Net Equity</div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
              {curr} ${totalEquity.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#070c12] p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Available Cash</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              {curr} ${totalCash.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#070c12] p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Market Value Invested</div>
            <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
              {curr} ${investedValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#070c12] p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Today&apos;s P&amp;L ($ &amp; %)</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${activeWb.dayPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {activeWb.dayPl >= 0 ? '+' : ''}${Number(activeWb.dayPl || 0).toFixed(2)} ({activeWb.dayPlPct >= 0 ? '+' : ''}{activeWb.dayPlPct || 0}%)
            </div>
          </div>

          <div className="bg-[#070c12] p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Since-Purchase P&amp;L</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${totalSincePurchase.plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalSincePurchase.plDollar >= 0 ? '+' : ''}${totalSincePurchase.plDollar.toFixed(2)} ({totalSincePurchase.plPct >= 0 ? '+' : ''}{totalSincePurchase.plPct.toFixed(1)}%)
            </div>
          </div>

          <div className="bg-[#070c12] p-2.5 rounded-lg border border-slate-800 flex flex-col justify-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Shield &amp; Enclave</div>
            <div className="text-xs font-bold font-mono mt-0.5 flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Closing-Basis • {exMeta.session_phase || 'REGULAR'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SESSION REFRESH BANNER (If cached token from older build expired) */}
      {sessionExpiredNotice && (
        <div className="bg-amber-950/50 border border-amber-500/50 rounded-xl p-3 text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Session Token Refresh Available:</strong> Showing verified fleet baseline. Sign in again to activate a 30-day persistent mobile session token.
            </span>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              🔄 Refresh Sign-In
            </button>
          )}
        </div>
      )}

      {/* 2. STAGED ORDERS PAD (If Active) */}
      {stagedNotification && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 text-xs font-mono flex items-center justify-between animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-300">
              <strong>STAGED ORDER ACTIVE:</strong> BUY {stagedNotification.ticker} limit ceiling {stagedNotification.currency} ${stagedNotification.price} (2% Chase Cap Enforced).
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
            Pending Market Routing
          </span>
        </div>
      )}

      {/* MOBILE / TABLET PRO DISPLAY VIEW SWITCHER */}
      <div className="xl:hidden grid grid-cols-3 gap-1.5 bg-[#0d1520] p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setMobileCockpitPane('HOLDINGS');
            setLeftPaneTab('HOLDINGS');
          }}
          className={`py-2 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            mobileCockpitPane === 'HOLDINGS'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Holdings ({filteredHoldings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileCockpitPane('INCEPTION');
            setLeftPaneTab('INCEPTION');
          }}
          className={`py-2 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            mobileCockpitPane === 'INCEPTION'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inception</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileCockpitPane('RADAR')}
          className={`py-2 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            mobileCockpitPane === 'RADAR'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Radar ({tickerList.length})</span>
        </button>
      </div>

      {/* 3. DUAL-PANE COCKPIT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LEFT PANE (XL: 6 cols): ACTIVE PORTFOLIO HOLDINGS OR SIGNAL INCEPTION */}
        <div className={`xl:col-span-6 bg-[#0d1520] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col ${
          mobileCockpitPane === 'RADAR' ? 'hidden xl:flex' : 'flex'
        }`}>
          <div className="p-3 border-b border-slate-800 bg-[#101b2a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Rolling Bar Sub-View Selector (Active Holdings vs Day-0 Inception) */}
              <div className="relative p-0.5 rounded-lg border border-slate-800 bg-[#070c12] select-none flex items-center">
                <div
                  className="absolute top-0.5 bottom-0.5 rounded bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/20 transition-transform duration-300 ease-out z-0 pointer-events-none"
                  style={{
                    width: 'calc(50% - 2px)',
                    left: '1px',
                    transform: leftPaneTab === 'HOLDINGS' 
                      ? 'translateX(0px)' 
                      : 'translateX(calc(100% + 2px))'
                  }}
                />
                <div className="relative grid grid-cols-2 gap-0.5 z-10 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setLeftPaneTab('HOLDINGS');
                      setMobileCockpitPane('HOLDINGS');
                    }}
                    className={`px-2.5 py-1 rounded font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                      leftPaneTab === 'HOLDINGS'
                        ? 'text-slate-950 font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>Holdings ({filteredHoldings.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeftPaneTab('INCEPTION');
                      setMobileCockpitPane('INCEPTION');
                    }}
                    className={`px-2.5 py-1 rounded font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                      leftPaneTab === 'INCEPTION'
                        ? 'text-slate-950 font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Day-0 Inception</span>
                  </button>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {activeWb.name}
              </span>
            </div>

            {activeWb.id !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setEditingWorkbook(activeWb);
                  setBuilderInitialTab('WORKBOOK_BUILDER');
                  setIsBuilderOpen(true);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold transition"
              >
                <Settings2 className="w-3 h-3 text-emerald-400" />
                <span>Workbook Rules</span>
              </button>
            )}
          </div>

          {leftPaneTab === 'INCEPTION' ? (
            <div className="flex-1 overflow-x-auto">
              <SignalInceptionView
                userSession={userSession}
                selectedWorkbook={selectedWorkbook}
                onSelectTicker={onSelectTicker}
                theme="dark"
                compact={true}
              />
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              {filteredHoldings.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-slate-400 space-y-2">
                  <div className="text-slate-300">No active positions currently open in this node.</div>
                  <div className="text-emerald-400">
                    {curr} ${totalCash.toLocaleString('en-AU', { minimumFractionDigits: 2 })} liquid cash ready for allocation.
                  </div>
                </div>
              ) : (
                <>
                  {/* MOBILE PRO HOLDINGS CARDS (< 640px) */}
                  <div className="sm:hidden divide-y divide-slate-800/80">
                    {filteredHoldings.map((pos) => {
                      const units = Number(pos.units || 0);
                      const avgCost = Number(pos.avgCost || 0);
                      const livePrice = Number(pos.livePrice || 0);
                      const costBasis = Number(pos.costBasis || (units * avgCost));
                      const marketValue = Number(pos.marketValue || (units * livePrice));
                      const plDollar = pos.plDollar !== undefined ? Number(pos.plDollar) : (marketValue - costBasis);
                      const plPct = pos.plPct !== undefined ? Number(pos.plPct) : (costBasis > 0 ? (plDollar / costBasis) * 100 : 0);
                      const dayChangePct = Number(pos.dayChangePct ?? pos.day_change_pct ?? 0);
                      const dayChangeDollar = pos.dayPlDollar !== undefined
                        ? Number(pos.dayPlDollar)
                        : pos.dayChangeDollar !== undefined
                          ? Number(pos.dayChangeDollar)
                          : (marketValue * (dayChangePct / 100));
                      const volInfo = formatVerifiedVolMult(pos.vol_mult ?? pos.volMult, pos.vol_verified);
                      const shield = resolveAntiChurnShield(pos);

                      return (
                        <div
                          key={`mob-${pos.workbook}-${pos.ticker}`}
                          onClick={() =>
                            onSelectTicker &&
                            onSelectTicker({
                              ...pos,
                              ticker: pos.ticker,
                              name: pos.company || pos.ticker,
                              price: livePrice,
                              avgCost,
                              units,
                              costBasis,
                              marketValue,
                              plDollar,
                              plPct,
                              dayChangeDollar,
                              dayChangePct,
                              volInfo,
                              shield,
                              conviction: pos.conviction || 'C:9',
                              currency: pos.currency || curr,
                              initialDrawerTab: 'POSITION'
                            })
                          }
                          className="p-3.5 hover:bg-slate-800/40 active:bg-slate-800/70 cursor-pointer transition space-y-2 font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-emerald-400">{pos.ticker}</span>
                                <span className="text-xs text-slate-300 truncate max-w-[140px]">{pos.company}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {units.toLocaleString()} units • Avg ${avgCost.toFixed(avgCost < 1 ? 3 : 2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-100">
                                ${livePrice.toFixed(livePrice < 1 ? 3 : 2)}
                              </div>
                              <div className={`text-xs font-bold ${plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {plDollar >= 0 ? '+' : ''}${Math.round(plDollar)} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-800/70 text-[10px]">
                            <div>
                              <span className="text-slate-500 block">Mkt Value</span>
                              <span className="text-slate-200 font-bold">${Math.round(marketValue).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Day P&amp;L</span>
                              <span className={`font-bold ${dayChangeDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {dayChangeDollar >= 0 ? '+' : ''}${Math.round(dayChangeDollar)} ({dayChangePct >= 0 ? '+' : ''}{dayChangePct.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 block">ATR Stop</span>
                              <span className="text-amber-400 font-bold">${Number(pos.stopLoss || 0).toFixed(pos.stopLoss < 1 ? 3 : 2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP / TABLET TABLE (>= 640px) */}
                  <table className="hidden sm:table w-full text-left text-xs font-mono">
                  <thead className="bg-[#070c12] text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Ticker</th>
                      <th className="py-2.5 px-2 text-right">Entry &amp; Cost</th>
                      <th className="py-2.5 px-2 text-right">Live &amp; Vol</th>
                      <th className="py-2.5 px-2 text-right">Day P&amp;L</th>
                      <th className="py-2.5 px-2 text-right">Total P&amp;L</th>
                      <th className="py-2.5 px-2 text-right">Stop &amp; Shield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredHoldings.map((pos) => {
                      const units = Number(pos.units || 0);
                      const avgCost = Number(pos.avgCost || 0);
                      const livePrice = Number(pos.livePrice || 0);
                      const costBasis = Number(pos.costBasis || (units * avgCost));
                      const marketValue = Number(pos.marketValue || (units * livePrice));
                      const plDollar = pos.plDollar !== undefined ? Number(pos.plDollar) : (marketValue - costBasis);
                      const plPct = pos.plPct !== undefined ? Number(pos.plPct) : (costBasis > 0 ? (plDollar / costBasis) * 100 : 0);
                      const dayChangePct = Number(pos.dayChangePct ?? pos.day_change_pct ?? 0);
                      const dayChangeDollar = pos.dayPlDollar !== undefined
                        ? Number(pos.dayPlDollar)
                        : pos.dayChangeDollar !== undefined
                          ? Number(pos.dayChangeDollar)
                          : (marketValue * (dayChangePct / 100));
                      const volInfo = formatVerifiedVolMult(pos.vol_mult ?? pos.volMult, pos.vol_verified);
                      const shield = resolveAntiChurnShield(pos);
                      const rawBoughtAt = pos.bought_at || pos.boughtAt || null;
                      const daysHeld = pos.daysHeld ?? computeDaysSince(rawBoughtAt);

                      return (
                        <tr
                          key={`${pos.workbook}-${pos.ticker}`}
                          onClick={() =>
                            onSelectTicker &&
                            onSelectTicker({
                              ...pos,
                              ticker: pos.ticker,
                              name: pos.company || pos.ticker,
                              price: livePrice,
                              avgCost,
                              units,
                              costBasis,
                              marketValue,
                              plDollar,
                              plPct,
                              dayChangeDollar,
                              dayChangePct,
                              volInfo,
                              shield,
                              conviction: pos.conviction || 'C:9',
                              currency: pos.currency || curr,
                              initialDrawerTab: 'POSITION'
                            })
                          }
                          className="hover:bg-slate-800/50 cursor-pointer transition"
                        >
                          <td className="py-2.5 px-3 font-bold text-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-bold">{pos.ticker}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate max-w-[80px]">{pos.company}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              {units.toLocaleString()}u {daysHeld !== null ? `• ${daysHeld}d` : ''}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="text-slate-200">${avgCost.toFixed(avgCost < 1 ? 3 : 2)}</div>
                            <div className="text-[9px] text-slate-500">${Math.round(costBasis).toLocaleString()}</div>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="font-bold text-slate-100">${livePrice.toFixed(livePrice < 1 ? 3 : 2)}</div>
                            <div className={`text-[9px] ${volInfo.verified ? 'text-cyan-400' : 'text-amber-400'}`}>
                              {volInfo.label}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-bold">
                            <div className={dayChangeDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {dayChangeDollar >= 0 ? '+' : ''}${Math.round(dayChangeDollar)}
                            </div>
                            <div className={`text-[9px] ${dayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {dayChangePct >= 0 ? '+' : ''}{dayChangePct.toFixed(1)}%
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-bold">
                            <div className={plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {plDollar >= 0 ? '+' : ''}${Math.round(plDollar)}
                            </div>
                            <div className={`text-[9px] ${plPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%)
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="text-amber-400 font-bold">
                              ${Number(pos.stopLoss || 0).toFixed(pos.stopLoss < 1 ? 3 : 2)}
                            </div>
                            <div className="text-[9px] text-emerald-400 truncate max-w-[110px] ml-auto">
                              {shield.label}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANE (XL: 6 cols): REAL-TIME QUANT SCANNER & RADAR */}
        <div className={`xl:col-span-6 bg-[#0d1520] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col ${
          mobileCockpitPane !== 'RADAR' ? 'hidden xl:flex' : 'flex'
        }`}>
          <div className="p-3 border-b border-slate-800 bg-[#101b2a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                Market Radar ({activeExchange} • {activeTier.replace('_', ' ')})
              </h3>
            </div>

            {/* Sub-Switchers for Exchange and Tier in Cockpit */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex bg-[#070c12] rounded-lg p-0.5 border border-slate-800">
                {['ASX', 'NYSE', 'NASDAQ', 'LSE', 'TSX'].map(ex => (
                  <button
                    key={ex}
                    onClick={() => onSelectExchange && onSelectExchange(ex)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      activeExchange === ex
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <div className="flex bg-[#070c12] rounded-lg p-0.5 border border-slate-800">
                {[
                  { id: 'TIER_3', label: '🚀 T3 Moonshot' },
                  { id: 'TIER_1', label: '🛡️ T1 Core' },
                  { id: 'POI_SNIPER', label: '🎯 POI' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTier && onSelectTier(t.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      activeTier === t.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {/* MOBILE PRO RADAR CARDS (< 640px) */}
            <div className="sm:hidden divide-y divide-slate-800/80">
              {tickerList.map((item) => (
                <div
                  key={`mob-radar-${item.ticker}`}
                  onClick={() => onSelectTicker && onSelectTicker(item)}
                  className="p-3.5 hover:bg-slate-800/40 active:bg-slate-800/70 cursor-pointer transition space-y-2 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-emerald-400">{item.ticker}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                          {item.conviction}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{item.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-100">
                        {item.currency} ${item.price.toFixed(item.price < 1 ? 4 : 2)}
                      </div>
                      <div className={`text-xs font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/70 text-[10px]">
                    <span className="text-slate-400">
                      RSI: <strong className="text-slate-200">{item.rsi.toFixed(1)}</strong> • MACD: <strong className="text-emerald-400">{item.macd}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Inspect &amp; Trade →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP / TABLET RADAR TABLE (>= 640px) */}
            <table className="hidden sm:table w-full text-left text-xs font-mono">
              <thead className="bg-[#070c12] text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Symbol / Name</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-right">Change</th>
                  <th className="py-2.5 px-2 text-center">Score</th>
                  <th className="py-2.5 px-2">RSI (14)</th>
                  <th className="py-2.5 px-2">MACD Vector</th>
                  <th className="py-2.5 px-2">OBV Flow</th>
                  <th className="py-2.5 px-2 text-center">Trade Pad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickerList.map((item) => (
                  <tr
                    key={item.ticker}
                    onClick={() => onSelectTicker && onSelectTicker(item)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-2 px-3 font-bold text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">{item.ticker}</span>
                        <span className="text-[10px] text-slate-400 font-normal truncate max-w-[110px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-slate-100">
                      {item.currency} ${item.price.toFixed(item.price < 1 ? 4 : 2)}
                    </td>
                    <td className="py-2 px-2 text-right font-bold">
                      <span className={`inline-flex items-center gap-0.5 ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[9px]">
                        {item.conviction}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={item.rsi < 40 ? 'text-emerald-400 font-bold' : item.rsi > 70 ? 'text-rose-400' : 'text-slate-300'}>
                        {item.rsi.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.macd === 'BULLISH_HOOK'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.macd}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-[10px] ${
                        item.obv === 'SURGING'
                          ? 'text-cyan-400 font-bold'
                          : item.obv === 'ACCUMULATING'
                            ? 'text-emerald-300'
                            : 'text-slate-400'
                      }`}>
                        {item.obv}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectTicker) onSelectTicker(item);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-200 text-[10px] font-bold transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. WORKBOOK AUTO-BUILDER & GLOBAL AI HUB MODAL */}
      <WorkbookAutoBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        userSession={userSession}
        initialWorkbook={editingWorkbook}
        initialTab={builderInitialTab}
        onWorkbookSaved={(savedWb) => {
          fetchFleetData();
          if (savedWb?.id) setSelectedWorkbook(savedWb.id);
        }}
      />
    </div>
  );
}
