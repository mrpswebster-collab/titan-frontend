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
  Activity
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
  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ACTIVE_HOLDINGS'); // 'ACTIVE_HOLDINGS' | 'SIGNAL_INCEPTION'
  const [workbooks, setWorkbooks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [accessTier, setAccessTier] = useState('ISOLATED_CLIENT_ENCLAVE');
  const [loading, setLoading] = useState(true);

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
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkbooks(data.workbooks || []);
        setHoldings(data.holdings || []);
        setAccessTier(data.access_tier || 'ISOLATED_CLIENT_ENCLAVE');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Direct Banner to Fleet & Setup Menu (Hidden in Mobile Phone Mode) */}
      {!isMobileMode && (
      <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isLight
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200 shadow-sm'
          : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border-emerald-800/40 shadow-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                Fleet Architecture Hub
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Rule 19 Isolated
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${textPrimary}`}>
              Multi-Workbook Google Sheets building, VIP invite codes, Cloud Sentinel daemons, and FastMCP developer keys are managed in the dedicated <strong>Fleet & Setup</strong> menu.
            </p>
          </div>
        </div>

        {onNavigateToFleetSetup && (
          <button
            type="button"
            onClick={onNavigateToFleetSetup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 transition shrink-0"
          >
            <span>Open Fleet & Setup Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      )}

      {/* 2. Workbook Filter Pills & Sub-View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {workbooks.length > 1 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className={`text-xs font-mono font-bold uppercase shrink-0 ${textMuted}`}>
              Ledger:
            </span>
            <button
              type="button"
              onClick={() => setSelectedWorkbook('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shadow-sm ${
                selectedWorkbook === 'ALL'
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                  : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Consolidated (All Nodes)
            </button>

            {workbooks.map(wb => (
              <button
                key={wb.id}
                type="button"
                onClick={() => setSelectedWorkbook(wb.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shadow-sm shrink-0 flex items-center gap-1.5 ${
                  selectedWorkbook === wb.id
                    ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                    : isLight
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{wb.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedWorkbook === wb.id ? 'bg-black/20 text-black' : 'bg-slate-700 text-emerald-300'}`}>
                  {wb.exchange || 'ASX'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold uppercase ${textMuted}`}>
              Active Banking Ledger:
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800/90 border-slate-700 text-emerald-300'
            }`}>
              {activeWb.name} ({activeWb.exchange || currencyInput})
            </span>
          </div>
        )}

        {/* Segmented Sub-Tab Switcher: Active Holdings vs Signal Inception */}
        <div className={`inline-flex p-1 rounded-xl border self-start md:self-auto ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0b1120] border-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => setActiveSubTab('ACTIVE_HOLDINGS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeSubTab === 'ACTIVE_HOLDINGS'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Active Holdings ({filteredHoldings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('SIGNAL_INCEPTION')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeSubTab === 'SIGNAL_INCEPTION'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signal Inception (Day-0 Tracker)</span>
          </button>
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
                  Institutional Holdings &amp; Anti-Churn Shield Ledger — {activeWb.name}
                </h2>
              </div>
              <p className={`text-[11px] font-mono mt-0.5 ${textMuted}`}>
                Click any position row to inspect its AI Dossier ([SCHEMA:V2]), Exit-Shield floors, and Day-0 Signal Inception Post-Mortem.
              </p>
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
