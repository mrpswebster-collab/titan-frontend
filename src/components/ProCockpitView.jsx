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
  onOpenAIAnalyst
}) {
  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [leftPaneTab, setLeftPaneTab] = useState('HOLDINGS'); // 'HOLDINGS' | 'INCEPTION'
  const [workbooks, setWorkbooks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [accessTier, setAccessTier] = useState('ISOLATED_CLIENT_ENCLAVE');
  const [loading, setLoading] = useState(false);

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

      {/* 3. DUAL-PANE COCKPIT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LEFT PANE (XL: 6 cols): ACTIVE PORTFOLIO HOLDINGS OR SIGNAL INCEPTION */}
        <div className="xl:col-span-6 bg-[#0d1520] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-[#101b2a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex bg-[#070c12] rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLeftPaneTab('HOLDINGS')}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                    leftPaneTab === 'HOLDINGS'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Holdings ({filteredHoldings.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeftPaneTab('INCEPTION')}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                    leftPaneTab === 'INCEPTION'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Day-0 Inception</span>
                </button>
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
                <table className="w-full text-left text-xs font-mono">
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
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANE (XL: 6 cols): REAL-TIME QUANT SCANNER & RADAR */}
        <div className="xl:col-span-6 bg-[#0d1520] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-[#101b2a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                Market Radar ({activeExchange} • {activeTier.replace('_', ' ')})
              </h3>
            </div>

            {/* Sub-Switchers for Exchange and Tier in Cockpit */}
            <div className="flex items-center gap-1.5">
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
            <table className="w-full text-left text-xs font-mono">
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
