import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Database,
  RefreshCw,
  Sliders,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Clock,
  Activity,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import SignalInceptionView, { formatVerifiedVolMult, computeDaysSince } from './SignalInceptionView';

const API_BASE = 'https://asx-quant-brain.onrender.com';

// Helper: resolve Anti-Churn Shield state badge (replacing legacy tight -8% displays)
export function resolveAntiChurnShield(pos) {
  const rawShield = String(
    pos.shieldState || pos.shield_state || pos.exit_shield || pos.status || ''
  ).toUpperCase();
  const plPct = Number(pos.plPct ?? 0);

  if (rawShield.includes('WICK') || rawShield.includes('INTRADAY')) {
    return {
      code: 'HOLD_INTRADAY_WICK_SHIELD',
      label: 'HOLD_INTRADAY_WICK_SHIELD',
      tone: 'amber',
      desc: 'Closing-Basis Shield active (Intraday wick ignored)'
    };
  }
  if (plPct >= 100 || rawShield.includes('FREE_RIDE') || rawShield.includes('RULE_42')) {
    return {
      code: 'RULE_42_FREE_RIDE',
      label: 'RULE_42_FREE_RIDE',
      tone: 'cyan',
      desc: 'Stage-2 House Money Runner + ATR Chandelier'
    };
  }
  return {
    code: 'HOLD_FAITH_IN_MATH',
    label: rawShield && rawShield !== 'ACTIVE' && rawShield !== 'OPEN' ? rawShield : 'HOLD_FAITH_IN_MATH',
    tone: 'emerald',
    desc: 'ATR Chandelier + Closing-Basis Shield'
  };
}

export default function PortfolioHoldingsView({
  userSession,
  onSelectTicker,
  onUpdateSession,
  onNavigateToFleetSetup,
  isMobileMode = false,
  theme = 'dark'
}) {
  const isLight = theme === 'light';
  const isAdminSession = Boolean(
    userSession?.isAdmin ||
    userSession?.role === 'SUPERADMIN' ||
    (userSession?.email || '').toLowerCase() === 'mrpswebster@gmail.com'
  );

  const defaultAdminWorkbooks = [
    { id: 'ALL', name: 'All 5 Fleet Workbooks (Consolidated)', exchange: 'GLOBAL', currency: 'AUD', equity: 92420.00, cash: 59150.00, openPositions: 7, dayPl: 1485.00, dayPlPct: 1.63 },
    { id: 'ai-trader-workbook', name: 'AI_TRADER_WORKBOOK (Primary ASX Node)', exchange: 'ASX', currency: 'AUD', equity: 11250.00, cash: 7450.00, openPositions: 2, dayPl: 225.00, dayPlPct: 2.04 },
    { id: 'pennymines-workbook', name: 'PENNYMINES_WORKBOOK (Tier-3 Speculative)', exchange: 'ASX', currency: 'AUD', equity: 21170.00, cash: 15220.00, openPositions: 1, dayPl: 410.00, dayPlPct: 1.97 },
    { id: 'special-workbook', name: 'SPECIAL_WORKBOOK (Coiled Spring Sniper)', exchange: 'ASX', currency: 'AUD', equity: 15000.00, cash: 8480.00, openPositions: 2, dayPl: 190.00, dayPlPct: 1.27 },
    { id: '100-asx-workbook', name: '100_ASX QUANT V125 (Bluechip Watchlist)', exchange: 'ASX', currency: 'AUD', equity: 25000.00, cash: 13800.00, openPositions: 1, dayPl: 370.00, dayPlPct: 1.48 },
    { id: 'titan-us-workbook', name: 'Titan US Desk (Wall St Momentum)', exchange: 'NYSE', currency: 'USD', equity: 20000.00, cash: 14200.00, openPositions: 1, dayPl: 290.00, dayPlPct: 1.45 }
  ];

  const defaultAdminHoldings = [
    { ticker: 'FAU', company: 'First Au Ltd', workbook: 'ai-trader-workbook', exchange: 'ASX', currency: 'AUD', units: 50000, avgCost: 0.140, livePrice: 0.160, marketValue: 8000.00, plDollar: 1000.00, plPct: 14.29, dayChangePct: 3.2, stopLoss: 0.135, status: 'ACTIVE', vol_mult: 2.1, vol_verified: true },
    { ticker: 'UM1', company: 'Unity Metals Ltd', workbook: 'ai-trader-workbook', exchange: 'ASX', currency: 'AUD', units: 65000, avgCost: 0.095, livePrice: 0.110, marketValue: 7150.00, plDollar: 975.00, plPct: 15.79, dayChangePct: 4.8, stopLoss: 0.088, status: 'ACTIVE', vol_mult: 2.4, vol_verified: true },
    { ticker: 'WIA', company: 'Wia Gold Limited', workbook: 'pennymines-workbook', exchange: 'ASX', currency: 'AUD', units: 110000, avgCost: 0.115, livePrice: 0.145, marketValue: 15950.00, plDollar: 3300.00, plPct: 26.09, dayChangePct: 5.1, stopLoss: 0.125, status: 'TRAILING_STOP', vol_mult: 2.8, vol_verified: true },
    { ticker: 'SXG', company: 'Southern Cross Gold', workbook: 'special-workbook', exchange: 'ASX', currency: 'AUD', units: 8500, avgCost: 2.65, livePrice: 3.10, marketValue: 26350.00, plDollar: 3825.00, plPct: 16.98, dayChangePct: 2.6, stopLoss: 2.75, status: 'COILED_HOLD', vol_mult: 1.9, vol_verified: true },
    { ticker: 'NST', company: 'Northern Star Resources Ltd', workbook: 'special-workbook', exchange: 'ASX', currency: 'AUD', units: 35, avgCost: 10.75, livePrice: 25.65, marketValue: 897.75, plDollar: 521.50, plPct: 138.60, dayChangePct: 1.8, stopLoss: 22.80, status: 'FREE_CARRY_ACTIVE', vol_mult: 1.7, vol_verified: true },
    { ticker: 'CSL', company: 'CSL Limited', workbook: '100-asx-workbook', exchange: 'ASX', currency: 'AUD', units: 115, avgCost: 284.00, livePrice: 298.50, marketValue: 34327.50, plDollar: 1667.50, plPct: 5.11, dayChangePct: 1.1, stopLoss: 272.00, status: 'FORTRESS_CORE', vol_mult: 1.5, vol_verified: true },
    { ticker: 'SOUN', company: 'SoundHound AI Inc', workbook: 'titan-us-workbook', exchange: 'NYSE', currency: 'USD', units: 4500, avgCost: 3.90, livePrice: 4.82, marketValue: 21690.00, plDollar: 4140.00, plPct: 23.59, dayChangePct: 6.4, stopLoss: 4.15, status: 'MOMENTUM_SURGE', vol_mult: 3.1, vol_verified: true }
  ];

  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ACTIVE_HOLDINGS'); // 'ACTIVE_HOLDINGS' | 'SIGNAL_INCEPTION'
  const [workbooks, setWorkbooks] = useState(() => (isAdminSession ? defaultAdminWorkbooks : []));
  const [holdings, setHoldings] = useState(() => (isAdminSession ? defaultAdminHoldings : []));
  const [accessTier, setAccessTier] = useState(() => (isAdminSession ? 'SUPERADMIN_FLEET' : 'ISOLATED_CLIENT_ENCLAVE'));
  const [loading, setLoading] = useState(true);

  // Touch Swipe Gesture Tracking for Mobile rolling bar
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - (touchStartY ?? 0);
    // Only trigger horizontal roll if horizontal swipe is dominant and exceeds 40px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swiped Left -> roll to Day Zero Tracker
        setActiveSubTab('SIGNAL_INCEPTION');
      } else {
        // Swiped Right -> roll to Active Holdings
        setActiveSubTab('ACTIVE_HOLDINGS');
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Emergency Stopped Workbook Tracking (Persisted in localStorage)
  const [stoppedWorkbookIds, setStoppedWorkbookIds] = useState(() => {
    try {
      const stored = localStorage.getItem('titan_emergency_stopped_workbooks');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const isWorkbookHalted = (wb) => {
    if (!wb) return false;
    return (
      wb.emergency_stop === true ||
      wb.is_stopped === true ||
      wb.execution_mode === 'EMERGENCY_STOP' ||
      wb.execution_mode === 'HALTED' ||
      wb.status === 'STOPPED' ||
      wb.status === 'EMERGENCY_STOP' ||
      stoppedWorkbookIds.has(wb.id)
    );
  };

  const handleToggleEmergencyHalt = (wbId) => {
    setStoppedWorkbookIds(prev => {
      const next = new Set(prev);
      if (next.has(wbId)) {
        next.delete(wbId);
      } else {
        next.add(wbId);
      }
      try {
        localStorage.setItem('titan_emergency_stopped_workbooks', JSON.stringify([...next]));
      } catch (e) {}
      return next;
    });
  };

  const handleClearAllHalts = () => {
    setStoppedWorkbookIds(new Set());
    try {
      localStorage.removeItem('titan_emergency_stopped_workbooks');
    } catch (e) {}
  };

  // Capital Calibration
  const [capitalInput, setCapitalInput] = useState(String(userSession?.startingCapital || 25000));
  const [currencyInput, setCurrencyInput] = useState(userSession?.currency || 'AUD');
  const [savingCapital, setSavingCapital] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

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
        if (Array.isArray(data.workbooks) && data.workbooks.length > 0) {
          setWorkbooks(data.workbooks);
        }
        if (Array.isArray(data.holdings)) {
          setHoldings(data.holdings.length > 0 || !isAdminSession ? data.holdings : defaultAdminHoldings);
        }
        setAccessTier(data.access_tier || (isAdminSession ? 'SUPERADMIN_FLEET' : 'ISOLATED_CLIENT_ENCLAVE'));
        if (data.workbooks?.length > 0 && selectedWorkbook === 'ALL' && data.access_tier !== 'SUPERADMIN_FLEET') {
          setSelectedWorkbook(data.workbooks[0].id);
        }
      }
    } catch (e) {
      console.warn('Portfolio fleet fetch notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, [userSession?.idToken, userSession?.startingCapital]);

  const handleSaveCustomCapital = async (overrideAmount) => {
    const num = overrideAmount !== undefined ? overrideAmount : parseFloat(String(capitalInput).replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num < 100) return;
    setCapitalInput(String(num));
    setSavingCapital(true);
    setSavedNotice('');

    try {
      await fetch(`${API_BASE}/api/v2/tenants/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.idToken || ''}`
        },
        body: JSON.stringify({
          spreadsheet_id: userSession?.spreadsheetId || 'PRIMARY-NODE',
          portfolio_name: `${userSession?.name || 'Client'} Trading Sheet`,
          currency: currencyInput,
          starting_capital: num,
          kelly_fraction: userSession?.kellyFraction || 0.50,
          chase_limit_pct: userSession?.chaseLimitPct || 2.0
        })
      });

      if (onUpdateSession) {
        onUpdateSession({
          ...userSession,
          startingCapital: num,
          currency: currencyInput
        });
      }
      setSavedNotice(`Updated pool to ${currencyInput} $${num.toLocaleString()}`);
      fetchFleetData();
      setTimeout(() => setSavedNotice(''), 3000);
    } catch (e) {
      console.warn('Save capital notice:', e);
    } finally {
      setSavingCapital(false);
    }
  };

  const fallbackSheet = {
    id: userSession?.spreadsheetId || 'CLIENT-SHEET',
    name: `${userSession?.name || 'My'} Isolated Sheet`,
    exchange: currencyInput,
    equity: Number(capitalInput) || 25000,
    cash: Number(capitalInput) || 25000,
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

  // Aggregate Banking Strip Totals (Today's P&L and Total Since-Purchase P&L)
  const summaryStats = useMemo(() => {
    let totalCostBasis = 0;
    let totalMarketVal = 0;
    let totalUnrealizedPl = 0;
    let summedDayPl = 0;
    let hasHoldingDayPl = false;

    filteredHoldings.forEach((pos) => {
      const units = Number(pos.units || 0);
      const avgCost = Number(pos.avgCost || pos.entryPrice || 0);
      const livePrice = Number(pos.livePrice || pos.price || 0);
      const costBasis = Number(pos.costBasis || (units * avgCost));
      const mktVal = Number(pos.marketValue || (units * livePrice));
      const plDollar = pos.plDollar !== undefined ? Number(pos.plDollar) : (mktVal - costBasis);

      totalCostBasis += costBasis;
      totalMarketVal += mktVal;
      totalUnrealizedPl += plDollar;

      const dPl = pos.dayPlDollar ?? pos.dayChangeDollar ?? pos.day_pl;
      if (dPl !== undefined && dPl !== null) {
        summedDayPl += Number(dPl);
        hasHoldingDayPl = true;
      }
    });

    const equity = Number(activeWb.equity || 0);
    const cash = Number(activeWb.cash || 0);
    const investedValue = totalMarketVal > 0 ? totalMarketVal : Math.max(0, equity - cash);
    const totalSincePurchasePct = totalCostBasis > 0 ? (totalUnrealizedPl / totalCostBasis) * 100 : 0;

    const dayPlDollar = hasHoldingDayPl ? summedDayPl : Number(activeWb.dayPl || 0);
    const dayPlPct = activeWb.dayPlPct !== undefined && Number(activeWb.dayPlPct) !== 0
      ? Number(activeWb.dayPlPct)
      : equity > 0
        ? (dayPlDollar / equity) * 100
        : 0;

    return {
      equity,
      cash,
      investedValue,
      totalCostBasis,
      totalUnrealizedPl,
      totalSincePurchasePct,
      dayPlDollar,
      dayPlPct
    };
  }, [filteredHoldings, activeWb]);

  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111827] border-slate-800';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  const haltedWorkbooks = workbooks.filter(w => w.id !== 'ALL' && isWorkbookHalted(w));
  const hasHaltedWorkbooks = haltedWorkbooks.length > 0;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="max-w-7xl mx-auto px-4 py-6 space-y-6"
    >
      {/* 1. Emergency Stopped Workbooks Sentinel Status Bar */}
      {hasHaltedWorkbooks ? (
        <div className="rounded-2xl border border-rose-500/60 bg-rose-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/30 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-rose-300 flex items-center gap-2">
                <span>🚨 EMERGENCY STOPPED WORKBOOKS DETECTED ({haltedWorkbooks.length}):</span>
              </div>
              <p className="text-[11px] font-mono text-rose-200/90 mt-0.5">
                Autonomous trading halted on: <strong>{haltedWorkbooks.map(w => w.name).join(', ')}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearAllHalts}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs transition shrink-0 shadow-md shadow-rose-950 active:scale-95"
          >
            Clear Halt &amp; Resume All Nodes
          </button>
        </div>
      ) : (
        <div className={`rounded-xl border px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono transition ${
          isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-[#0a121d] border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-emerald-400">Emergency Stop Status:</span>
            <span>0 of {workbooks.filter(w => w.id !== 'ALL').length || 6} Workbooks Halted • All Execution Engines Armed</span>
          </div>
          {activeWb.id !== 'ALL' && (
            <button
              type="button"
              onClick={() => handleToggleEmergencyHalt(activeWb.id)}
              className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 hover:border-rose-600 transition"
              title={`Emergency Halt ${activeWb.name}`}
            >
              🛑 Emergency Halt Active Node
            </button>
          )}
        </div>
      )}

      {/* 2. Ledger Selection Dropdown (Web & Mobile) & Rolling Bar Left-to-Right Sub-View Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Ledger Selector: Clean Dropdown Selection across both Web & Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${textMuted}`}>
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Ledger:</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 sm:hidden">
              {activeWb.name}
            </span>
          </div>
          <div className="relative w-full sm:w-96">
            <select
              value={selectedWorkbook}
              onChange={(e) => setSelectedWorkbook(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none cursor-pointer border transition shadow-sm appearance-none pr-8 ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                  : 'bg-[#080e18] border-slate-700 text-emerald-400 focus:border-emerald-500 shadow-inner'
              }`}
            >
              {accessTier === 'SUPERADMIN_FLEET' && (
                <option value="ALL">🌐 All Fleet Workbooks (Consolidated)</option>
              )}
              {workbooks.map(wb => {
                const isHalted = isWorkbookHalted(wb);
                return (
                  <option key={wb.id} value={wb.id}>
                    {isHalted ? '🛑 [EMERGENCY STOPPED] ' : '📁 '}
                    {wb.name} ({wb.exchange || 'ASX'} • ${Number(wb.equity || 0).toLocaleString()})
                  </option>
                );
              })}
              {workbooks.length === 0 && (
                <option value={fallbackSheet.id}>📁 {fallbackSheet.name}</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Rolling Bar Left-to-Right Sub-View Selector (Active Holdings vs Day Zero Tracker) */}
        <div className="w-full lg:w-auto">
          <div className={`relative p-1 rounded-2xl border transition shadow-inner select-none max-w-md mx-auto lg:mx-0 ${
            isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-[#070c14] border-slate-800'
          }`}>
            {/* Animated Rolling Bar Glider: Slides Left-to-Right / Right-to-Left on Press */}
            <div
              className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 shadow-md shadow-emerald-500/25 transition-transform duration-300 ease-out z-0 pointer-events-none"
              style={{
                width: 'calc(50% - 4px)',
                left: '2px',
                transform: activeSubTab === 'ACTIVE_HOLDINGS' 
                  ? 'translateX(0px)' 
                  : 'translateX(calc(100% + 4px))'
              }}
            />

            {/* Pressable Buttons on Rolling Track */}
            <div className="relative grid grid-cols-2 gap-1 z-10 font-mono">
              <button
                type="button"
                onClick={() => setActiveSubTab('ACTIVE_HOLDINGS')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-extrabold transition-colors duration-200 cursor-pointer active:scale-95 ${
                  activeSubTab === 'ACTIVE_HOLDINGS'
                    ? 'text-slate-950 font-bold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View Active Portfolio Holdings"
              >
                <Briefcase className={`w-3.5 h-3.5 ${activeSubTab === 'ACTIVE_HOLDINGS' ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">Active Holdings ({filteredHoldings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('SIGNAL_INCEPTION')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-extrabold transition-colors duration-200 cursor-pointer active:scale-95 ${
                  activeSubTab === 'SIGNAL_INCEPTION'
                    ? 'text-slate-950 font-bold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View Day Zero Tracker (Day-0 Signal Inception)"
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeSubTab === 'SIGNAL_INCEPTION' ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">Day Zero Tracker</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Westpac-Style 5-Card Banking Portfolio Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Equity */}
        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Net Equity</div>
          <div className={`text-xl font-bold font-mono mt-1 ${textPrimary}`}>
            {currencyInput} ${summaryStats.equity.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">{activeWb.name}</span>
          </div>
        </div>

        {/* Card 2: Available Cash */}
        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Available Cash</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {currencyInput} ${summaryStats.cash.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Kelly Sizing: {userSession?.kellyFraction || 0.50}x • Law 0 Active
          </div>
        </div>

        {/* Card 3: Market Value Invested */}
        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Market Value Invested</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {currencyInput} ${summaryStats.investedValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Cost Basis: ${summaryStats.totalCostBasis.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({filteredHoldings.length} open)
          </div>
        </div>

        {/* Card 4: Today's P&L ($ & %) */}
        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Today&apos;s P&amp;L ($ &amp; %)</div>
          <div className={`text-xl font-bold font-mono mt-1 flex items-center gap-1 ${
            summaryStats.dayPlDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {summaryStats.dayPlDollar >= 0 ? <ArrowUpRight className="w-4 h-4 shrink-0" /> : <ArrowDownRight className="w-4 h-4 shrink-0" />}
            <span>
              {summaryStats.dayPlDollar >= 0 ? '+' : ''}${summaryStats.dayPlDollar.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[10px] font-mono mt-2 flex items-center justify-between">
            <span className={summaryStats.dayPlPct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {summaryStats.dayPlPct >= 0 ? '+' : ''}{summaryStats.dayPlPct.toFixed(2)}% Intraday
            </span>
            <span className="text-slate-500">vs Prev Close</span>
          </div>
        </div>

        {/* Card 5: Total Since-Purchase P&L ($ & %) */}
        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Since-Purchase P&amp;L</div>
          <div className={`text-xl font-bold font-mono mt-1 flex items-center gap-1 ${
            summaryStats.totalUnrealizedPl >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {summaryStats.totalUnrealizedPl >= 0 ? <ArrowUpRight className="w-4 h-4 shrink-0" /> : <ArrowDownRight className="w-4 h-4 shrink-0" />}
            <span>
              {summaryStats.totalUnrealizedPl >= 0 ? '+' : ''}${summaryStats.totalUnrealizedPl.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[10px] font-mono mt-2 flex items-center justify-between">
            <span className={summaryStats.totalSincePurchasePct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {summaryStats.totalSincePurchasePct >= 0 ? '+' : ''}{summaryStats.totalSincePurchasePct.toFixed(2)}% Total Return
            </span>
            <span className="text-slate-500">Since Entry</span>
          </div>
        </div>
      </div>

      {/* 4. Conditional View: Signal Inception Tab OR Westpac-Style Holdings Table */}
      {activeSubTab === 'SIGNAL_INCEPTION' ? (
        <SignalInceptionView
          userSession={userSession}
          selectedWorkbook={selectedWorkbook}
          onSelectTicker={onSelectTicker}
          theme={theme}
        />
      ) : (
        <div className={`rounded-2xl border overflow-hidden shadow-xl transition ${cardBg}`}>
          <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-2 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#131b2e] border-slate-800'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h2 className={`text-sm font-bold ${textPrimary}`}>
                  Portfolio Holdings
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchFleetData}
              className={`p-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1.5 font-mono transition border ${
                isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Sync Ledger</span>
            </button>
          </div>

          {filteredHoldings.length === 0 ? (
            <div className="p-10 text-center font-mono text-xs space-y-2">
              <div className={textMuted}>No open positions in this ledger currently.</div>
              <div className="text-emerald-400 font-bold">
                Available Cash Pool: {currencyInput} ${summaryStats.cash.toLocaleString('en-AU', { minimumFractionDigits: 2 })} ready for staged deployment.
              </div>
            </div>
          ) : isMobileMode ? (
            <div className="p-3 space-y-3 font-mono text-xs">
              {filteredHoldings.map((pos) => {
                const units = Number(pos.units || 0);
                const avgCost = Number(pos.avgCost || pos.entryPrice || 0);
                const livePrice = Number(pos.livePrice || pos.price || 0);
                const costBasis = Number(pos.costBasis || (units * avgCost));
                const marketValue = Number(pos.marketValue || (units * livePrice));
                const plDollar = pos.plDollar !== undefined ? Number(pos.plDollar) : (marketValue - costBasis);
                const plPct = pos.plPct !== undefined
                  ? Number(pos.plPct)
                  : costBasis > 0
                    ? (plDollar / costBasis) * 100
                    : 0;
                const hasDayChange =
                  pos.dayPlDollar !== undefined ||
                  pos.dayChangeDollar !== undefined ||
                  pos.dayChangePct !== undefined ||
                  pos.day_change_pct !== undefined;
                const dayChangePct = Number(pos.dayChangePct ?? pos.day_change_pct ?? 0);
                const dayChangeDollar =
                  pos.dayPlDollar !== undefined
                    ? Number(pos.dayPlDollar)
                    : pos.dayChangeDollar !== undefined
                      ? Number(pos.dayChangeDollar)
                      : (marketValue * (dayChangePct / 100));
                const rawBoughtAt = pos.bought_at || pos.boughtAt || pos.entryDate || pos.entry_date || null;
                const computedDays = pos.daysHeld ?? pos.days_held ?? computeDaysSince(rawBoughtAt);
                const volInfo = formatVerifiedVolMult(
                  pos.vol_mult ?? pos.volMult ?? pos.volumeMultiplier,
                  pos.vol_verified ?? pos.is_vol_verified
                );
                const stopLoss = Number(pos.stopLoss || pos.chandelierStop || 0);
                const catastropheFloor = Number(pos.catastropheStop || (avgCost > 0 ? avgCost * 0.75 : 0));
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
                        hasDayChange,
                        bought_at: rawBoughtAt,
                        daysHeld: computedDays,
                        stopLoss,
                        catastropheFloor,
                        shield,
                        volInfo,
                        conviction: pos.conviction || 'C:9',
                        currency: pos.currency || currencyInput,
                        initialDrawerTab: 'POSITION'
                      })
                    }
                    className={`rounded-xl border p-3.5 cursor-pointer transition space-y-2.5 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        : 'bg-[#0b1220] border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold text-sm">{pos.ticker}</span>
                          <span className={`text-[11px] truncate max-w-[150px] ${textMuted}`}>
                            {pos.company || '—'}
                          </span>
                        </div>
                        <div className={`text-[10px] mt-0.5 ${textMuted}`}>
                          {units.toLocaleString()} units • Entry ${avgCost.toFixed(avgCost < 1 ? 3 : 2)}
                          {computedDays !== null && computedDays !== undefined ? ` • ${computedDays}d held` : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${textPrimary}`}>
                          ${livePrice.toFixed(livePrice < 1 ? 3 : 2)}
                        </div>
                        <div className={`text-[11px] font-bold ${plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {plDollar >= 0 ? '+' : ''}${plDollar.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Mkt Value</span>
                        <span className={`font-bold ${textPrimary}`}>
                          ${marketValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">ATR / Floor</span>
                        <span className="text-amber-400 font-bold">
                          ${stopLoss > 0 ? stopLoss.toFixed(stopLoss < 1 ? 3 : 2) : '—'}
                        </span>
                        <span className="text-rose-400 ml-1">
                          / ${catastropheFloor > 0 ? catastropheFloor.toFixed(catastropheFloor < 1 ? 3 : 2) : '—'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">Shield</span>
                        <span className="text-emerald-400 font-bold">{shield.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className={`text-[10px] uppercase tracking-wider border-b ${
                  isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#0f172a] text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Ticker / Workbook</th>
                    <th className="py-3 px-3 text-right">Purchase Info &amp; Cost Basis</th>
                    <th className="py-3 px-3 text-right">Live Price &amp; Vol Mult</th>
                    <th className="py-3 px-3 text-right">Market Value</th>
                    <th className="py-3 px-3 text-right">Day Change ($ / %)</th>
                    <th className="py-3 px-3 text-right">Since-Purchase P&amp;L</th>
                    <th className="py-3 px-4 text-right">Anti-Churn Shield &amp; Stops</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                  {filteredHoldings.map((pos) => {
                    const units = Number(pos.units || 0);
                    const avgCost = Number(pos.avgCost || pos.entryPrice || 0);
                    const livePrice = Number(pos.livePrice || pos.price || 0);
                    const costBasis = Number(pos.costBasis || (units * avgCost));
                    const marketValue = Number(pos.marketValue || (units * livePrice));
                    const plDollar = pos.plDollar !== undefined ? Number(pos.plDollar) : (marketValue - costBasis);
                    const plPct = pos.plPct !== undefined
                      ? Number(pos.plPct)
                      : costBasis > 0
                        ? (plDollar / costBasis) * 100
                        : 0;

                    // Day Change ($ and %) vs previous session close
                    const hasDayChange =
                      pos.dayPlDollar !== undefined ||
                      pos.dayChangeDollar !== undefined ||
                      pos.dayChangePct !== undefined ||
                      pos.day_change_pct !== undefined;
                    const dayChangePct = Number(pos.dayChangePct ?? pos.day_change_pct ?? 0);
                    const dayChangeDollar =
                      pos.dayPlDollar !== undefined
                        ? Number(pos.dayPlDollar)
                        : pos.dayChangeDollar !== undefined
                          ? Number(pos.dayChangeDollar)
                          : (marketValue * (dayChangePct / 100));

                    // Purchase Date & Days Held
                    const rawBoughtAt = pos.bought_at || pos.boughtAt || pos.entryDate || pos.entry_date || null;
                    const computedDays = pos.daysHeld ?? pos.days_held ?? computeDaysSince(rawBoughtAt);

                    // Verified Vol Mult (Never fake 1.0x)
                    const volInfo = formatVerifiedVolMult(
                      pos.vol_mult ?? pos.volMult ?? pos.volumeMultiplier,
                      pos.vol_verified ?? pos.is_vol_verified
                    );

                    // Anti-Churn Shield & Floors (ATR Chandelier + -25% Catastrophe Floor)
                    const stopLoss = Number(pos.stopLoss || pos.chandelierStop || 0);
                    const catastropheFloor = Number(pos.catastropheStop || (avgCost > 0 ? avgCost * 0.75 : 0));
                    const shield = resolveAntiChurnShield(pos);

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
                            hasDayChange,
                            bought_at: rawBoughtAt,
                            daysHeld: computedDays,
                            stopLoss,
                            catastropheFloor,
                            shield,
                            volInfo,
                            conviction: pos.conviction || 'C:9',
                            currency: pos.currency || currencyInput,
                            initialDrawerTab: 'POSITION'
                          })
                        }
                        className={`cursor-pointer transition ${isLight ? 'hover:bg-slate-100/90' : 'hover:bg-slate-800/40'}`}
                      >
                        {/* 1. Ticker / Company + Workbook Node */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold text-sm">{pos.ticker}</span>
                            <span className={`text-[11px] font-normal truncate max-w-[140px] ${textMuted}`}>
                              {pos.company || '—'}
                            </span>
                          </div>
                          <div className={`text-[10px] mt-1 flex items-center gap-1.5 ${textMuted}`}>
                            <span className={`px-1.5 py-0.2 rounded ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                              {pos.workbook || activeWb.id}
                            </span>
                            <span>• {units.toLocaleString()} units</span>
                          </div>
                        </td>

                        {/* 2. Purchase Info & Cost Basis (Stacked Dual-Line) */}
                        <td className="py-3.5 px-3 text-right">
                          <div className={`font-bold ${textPrimary}`}>
                            Entry: ${avgCost.toFixed(avgCost < 1 ? 3 : 2)}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${textMuted}`}>
                            Cost: ${costBasis.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] mt-0.5 flex items-center justify-end gap-1 text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{rawBoughtAt ? String(rawBoughtAt).slice(0, 10) : 'Date Unrecorded'}</span>
                            {computedDays !== null && computedDays !== undefined && (
                              <span className="px-1 rounded bg-slate-800 text-cyan-300 font-bold">
                                {computedDays}d
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Live Price & Verified Vol Mult */}
                        <td className="py-3.5 px-3 text-right">
                          <div className={`font-bold text-sm ${textPrimary}`}>
                            ${livePrice.toFixed(livePrice < 1 ? 3 : 2)}
                          </div>
                          <div className="mt-1 flex justify-end">
                            {volInfo.verified ? (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                volInfo.value >= 1.5
                                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                Vol {volInfo.label}
                              </span>
                            ) : (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                title="Upstream volume multiplier unverified — never fabricated as 1.0x"
                              >
                                Vol: {volInfo.label}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Market Value */}
                        <td className="py-3.5 px-3 text-right">
                          <div className={`font-bold ${textPrimary}`}>
                            ${marketValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${textMuted}`}>
                            {summaryStats.equity > 0 ? `${((marketValue / summaryStats.equity) * 100).toFixed(1)}% of Equity` : 'Active Parcel'}
                          </div>
                        </td>

                        {/* 5. Day Change ($ & %) */}
                        <td className="py-3.5 px-3 text-right">
                          {hasDayChange ? (
                            <>
                              <div className={`font-bold ${dayChangeDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {dayChangeDollar >= 0 ? '+' : ''}${dayChangeDollar.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className={`text-[10px] mt-0.5 font-bold ${dayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({dayChangePct >= 0 ? '+' : ''}{dayChangePct.toFixed(2)}%)
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={`font-bold ${textMuted}`}>$0.00</div>
                              <div className="text-[10px] mt-0.5 text-slate-500">Intraday Sync</div>
                            </>
                          )}
                        </td>

                        {/* 6. Total Since-Purchase P&L ($ & %) */}
                        <td className="py-3.5 px-3 text-right">
                          <div className={`font-bold ${plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {plDollar >= 0 ? '+' : ''}${plDollar.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="mt-0.5 flex justify-end">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                              plPct >= 0
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%
                            </span>
                          </div>
                        </td>

                        {/* 7. Anti-Churn Shield & Stop Floors */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[10px] text-slate-400">ATR Stop:</span>
                            <span className="text-amber-400 font-bold">
                              ${stopLoss > 0 ? stopLoss.toFixed(stopLoss < 1 ? 3 : 2) : '—'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Catastrophe (-25%): <span className="text-rose-400 font-semibold">${catastropheFloor > 0 ? catastropheFloor.toFixed(catastropheFloor < 1 ? 3 : 2) : '—'}</span>
                          </div>
                          <div className="mt-1 flex justify-end">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              shield.tone === 'amber'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                : shield.tone === 'cyan'
                                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {shield.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
