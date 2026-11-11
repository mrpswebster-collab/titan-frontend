import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  Database,
  Layers
} from 'lucide-react';
import KellySizingCalculator from './KellySizingCalculator';
import { formatVerifiedVolMult, computeDaysSince } from './SignalInceptionView';
import { resolveAntiChurnShield } from './PortfolioHoldingsView';

const API_BASE = 'https://asx-quant-brain.onrender.com';

export default function InteractiveKinematicDrawer({
  ticker,
  data,
  userEquity = 25000,
  userSession,
  theme = 'dark',
  onClose,
  onExecuteOrder
}) {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState(data?.initialDrawerTab || 'POSITION'); // 'POSITION' | 'INCEPTION' | 'DOSSIER'
  const [orderUnits, setOrderUnits] = useState(Number(data?.units) > 0 ? Number(data.units) : 10000);
  const [inceptionRecord, setInceptionRecord] = useState(null);
  const [loadingInception, setLoadingInception] = useState(false);

  useEffect(() => {
    if (!ticker || !data) return;
    setActiveTab(data.initialDrawerTab || 'POSITION');
    if (Number(data.units) > 0) {
      setOrderUnits(Number(data.units));
    }
  }, [ticker, data?.initialDrawerTab, data?.units]);

  // Query live /api/v2/portfolio/inception for this ticker when drawer opens
  useEffect(() => {
    if (!ticker || !data) {
      setInceptionRecord(null);
      return;
    }
    let cancelled = false;
    const fetchTickerInception = async () => {
      if (data.first_ranked_at || data.firstRankedAt) {
        setInceptionRecord(data);
        return;
      }
      setLoadingInception(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/v2/portfolio/inception?ticker=${encodeURIComponent(ticker)}`,
          {
            headers: {
              'Authorization': `Bearer ${userSession?.idToken || ''}`
            }
          }
        );
        if (!cancelled && res.ok) {
          const payload = await res.json();
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.inception)
              ? payload.inception
              : Array.isArray(payload?.records)
                ? payload.records
                : [];
          const match = list.find(
            (r) => String(r.ticker || '').toUpperCase() === String(ticker).toUpperCase()
          );
          setInceptionRecord(match || null);
        } else if (!cancelled) {
          setInceptionRecord(null);
        }
      } catch (e) {
        if (!cancelled) setInceptionRecord(null);
      } finally {
        if (!cancelled) setLoadingInception(false);
      }
    };

    fetchTickerInception();
    return () => {
      cancelled = true;
    };
  }, [ticker, userSession?.idToken, data]);

  // Strict sequential guard: only return null AFTER all React hooks have been registered
  if (!ticker || !data) return null;

  const livePrice = Number(data.price ?? data.livePrice ?? 0);
  const avgCost = Number(data.avgCost ?? data.entryPrice ?? 0);
  const units = Number(data.units ?? 0);
  const costBasis = Number(data.costBasis ?? (units * avgCost));
  const marketValue = Number(data.marketValue ?? (units * livePrice));
  const isHolding = units > 0 && avgCost > 0;

  const plDollar = data.plDollar !== undefined
    ? Number(data.plDollar)
    : isHolding
      ? marketValue - costBasis
      : 0;
  const plPct = data.plPct !== undefined
    ? Number(data.plPct)
    : isHolding && costBasis > 0
      ? (plDollar / costBasis) * 100
      : Number(data.change ?? 0);

  const dayChangePct = Number(data.dayChangePct ?? data.day_change_pct ?? data.change ?? 0);
  const dayChangeDollar = data.dayChangeDollar !== undefined
    ? Number(data.dayChangeDollar)
    : data.dayPlDollar !== undefined
      ? Number(data.dayPlDollar)
      : isHolding
        ? marketValue * (dayChangePct / 100)
        : 0;

  const rawBoughtAt = data.bought_at || data.boughtAt || data.entryDate || null;
  const daysHeld = data.daysHeld ?? data.days_held ?? computeDaysSince(rawBoughtAt);

  const stopLoss = Number(data.stopLoss ?? data.chandelierStop ?? 0);
  const catastropheFloor = Number(
    data.catastropheFloor ?? data.catastropheStop ?? (avgCost > 0 ? avgCost * 0.75 : 0)
  );
  const shield = data.shield || resolveAntiChurnShield({ ...data, plPct });

  const volInfo = data.volInfo || formatVerifiedVolMult(
    data.vol_mult ?? data.volMult ?? data.volumeMultiplier,
    data.vol_verified ?? data.is_vol_verified
  );

  const currencySymbol = data.currency === 'USD' ? '$' : data.currency === 'GBP' ? '£' : 'A$';
  const freeRideProgress = Math.max(0, Math.min(100, plPct));

  // Merge any Day-0 inception fields from inceptionRecord or data
  const incep = inceptionRecord || data;
  const hasInception = Boolean(incep?.first_ranked_at || incep?.firstRankedAt || incep?.first_price);
  const firstPrice = Number(incep?.first_price ?? incep?.firstPrice ?? 0);
  const peakPrice = Number(incep?.peak_price_since_inception ?? incep?.peakPrice ?? 0);
  const lowPrice = Number(incep?.low_price_since_inception ?? incep?.lowPrice ?? 0);
  const mfePct = firstPrice > 0 && peakPrice > 0
    ? ((peakPrice - firstPrice) / firstPrice) * 100
    : Number(incep?.mfe_pct ?? (isHolding && plPct > 0 ? plPct : 0));
  const maePct = firstPrice > 0 && lowPrice > 0
    ? ((lowPrice - firstPrice) / firstPrice) * 100
    : Number(incep?.mae_pct ?? (isHolding && plPct < 0 ? plPct : 0));

  // Derive truthful attribution tags from real telemetry
  const attributionTags = [];
  if (volInfo.verified && volInfo.value >= 1.5) {
    attributionTags.push({ label: `Verified Vol Mult ${volInfo.label} (>= 1.5x)`, positive: true });
  } else {
    attributionTags.push({ label: 'Vol Mult N/A · Unverified', positive: false });
  }
  if (data.macd && String(data.macd).includes('BULLISH')) {
    attributionTags.push({ label: `MACD ${data.macd}`, positive: true });
  }
  if (isHolding) {
    attributionTags.push({ label: `Shield: ${shield.label}`, positive: true });
  }
  if (plPct >= 100) {
    attributionTags.push({ label: 'Rule 42 +100% Free-Ride Harvest Reached', positive: true });
  }

  const aiDossierText =
    data.aiDossier ||
    data.ai_dossier ||
    data.dossier ||
    data.catalyst_summary ||
    data.catalyst ||
    null;

  return (
    <div className={`fixed inset-y-0 right-0 w-full max-w-lg border-l shadow-2xl z-50 overflow-y-auto flex flex-col ${
      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f172a] border-slate-800 text-slate-100'
    }`}>
      {/* 1. Drawer Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold">{ticker}</span>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">
              {data.conviction || 'C:8'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {data.exchange || data.currency || 'ASX'}
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate max-w-[300px] mt-0.5">
            {data.name || data.company || data.sector || ticker}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Context-Aware 3-Tab Bar */}
      <div className={`px-4 pt-2.5 pb-2 border-b grid grid-cols-3 gap-1.5 text-[11px] font-mono ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0b1120] border-slate-800'
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab('POSITION')}
          className={`py-2 px-2 rounded-lg font-bold transition text-center truncate ${
            activeTab === 'POSITION'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          1. Shield &amp; Vectors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('INCEPTION')}
          className={`py-2 px-2 rounded-lg font-bold transition text-center truncate ${
            activeTab === 'INCEPTION'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          2. Day-0 Post-Mortem
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DOSSIER')}
          className={`py-2 px-2 rounded-lg font-bold transition text-center truncate ${
            activeTab === 'DOSSIER'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          3. [SCHEMA:V2] &amp; Trade
        </button>
      </div>

      {/* 3. Tab Content Body */}
      <div className="p-5 space-y-5 flex-1">
        {/* =================================================================== */}
        {/* TAB 1: POSITION, ANTI-CHURN SHIELD & KINEMATIC VECTORS              */}
        {/* =================================================================== */}
        {activeTab === 'POSITION' && (
          <>
            {/* Live Price, Day P&L & Total Since-Purchase P&L */}
            <div className={`border rounded-xl p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Live Market Price</span>
                <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                  dayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {dayChangePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  Day: {dayChangePct >= 0 ? '+' : ''}{dayChangePct.toFixed(2)}%
                  {isHolding && ` (${dayChangeDollar >= 0 ? '+' : ''}$${dayChangeDollar.toFixed(2)})`}
                </span>
              </div>

              <div className="font-mono text-2xl font-bold mb-3">
                {currencySymbol}{livePrice > 0 ? livePrice.toFixed(livePrice < 1 ? 3 : 2) : '0.00'}
              </div>

              {isHolding && (
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono py-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PURCHASE INFO</span>
                    <span className="font-bold">
                      {units.toLocaleString()} @ {currencySymbol}{avgCost.toFixed(avgCost < 1 ? 3 : 2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Cost: ${costBasis.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {daysHeld !== null && daysHeld !== undefined ? ` • ${daysHeld}d held` : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">SINCE-PURCHASE P&amp;L</span>
                    <span className={`font-bold text-sm ${plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {plDollar >= 0 ? '+' : ''}${plDollar.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${plPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}% Total Return)
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">RULE 24 (2% CHASE CAP)</span>
                  <span className="text-amber-400 font-semibold">
                    {currencySymbol}{(livePrice * 1.02).toFixed(livePrice < 1 ? 3 : 2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">VERIFIED VOL MULT</span>
                  <span className={volInfo.verified ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold'}>
                    {volInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Anti-Churn Shield & Stop Diagnostics Card */}
            <div className={`border rounded-xl p-4 space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Anti-Churn Exit Shield</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {shield.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b1120] border-slate-800'}`}>
                  <span className="text-[10px] text-slate-400 block">ATR CHANDELIER FLOOR</span>
                  <span className="text-sm font-bold text-amber-400">
                    {stopLoss > 0 ? `${currencySymbol}${stopLoss.toFixed(stopLoss < 1 ? 3 : 2)}` : 'Dynamic ATR'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Closing-basis evaluation</span>
                </div>

                <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b1120] border-slate-800'}`}>
                  <span className="text-[10px] text-slate-400 block">CATASTROPHE (-25%) FLOOR</span>
                  <span className="text-sm font-bold text-rose-400">
                    {catastropheFloor > 0 ? `${currencySymbol}${catastropheFloor.toFixed(catastropheFloor < 1 ? 3 : 2)}` : 'Entry × 0.75'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Hard intraday circuit breaker</span>
                </div>
              </div>

              {/* Rule 42 Free-Ride Progress */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>RULE 42 STAGE-1 (+100% FREE-RIDE HARVEST)</span>
                  <span className="text-emerald-400 font-bold">{freeRideProgress.toFixed(1)}% / 100%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
                    style={{ width: `${freeRideProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Kinematic Vectors (Live Data Bound — Zero Fake Strings) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rule 53 Kinematic Vectors</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className={`border p-3 rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
                  <span className="text-[10px] text-slate-400 block mb-1">MACD VECTOR</span>
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {data.macd || data.first_macd || 'Pending Sync'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {data.slope_3bar !== undefined ? `3-Bar Slope: ${data.slope_3bar}` : '3-bar histogram vector'}
                  </span>
                </div>

                <div className={`border p-3 rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
                  <span className="text-[10px] text-slate-400 block mb-1">WILDER&apos;S RSI (14)</span>
                  <span className="font-bold text-cyan-400 text-xs">
                    {data.rsi !== undefined && data.rsi !== null ? Number(data.rsi).toFixed(1) : 'Pending Sync'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Target Velocity: 52–68 zone
                  </span>
                </div>

                <div className={`border p-3 rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
                  <span className="text-[10px] text-slate-400 block mb-1">OBV / CMF FLOW</span>
                  <span className="font-bold text-amber-400 text-xs">
                    {data.obv || (data.cmf !== undefined ? `CMF ${data.cmf}` : 'Pending Sync')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Institutional flow gauge</span>
                </div>

                <div className={`border p-3 rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
                  <span className="text-[10px] text-slate-400 block mb-1">VERIFIED VOL MULT</span>
                  <span className={`font-bold text-xs ${volInfo.verified ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {volInfo.label}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {volInfo.verified ? 'Rule 53 >= 1.5x gate' : 'Never faked as 1.0x'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* TAB 2: TICKER LIFETIME POST-MORTEM & DAY-0 SIGNAL INCEPTION         */}
        {/* =================================================================== */}
        {activeTab === 'INCEPTION' && (
          <div className="space-y-4">
            <div className={`border rounded-xl p-4 space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    Ticker Lifetime Post-Mortem Card
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  hasInception
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {loadingInception ? 'Checking...' : hasInception ? 'Day-0 Linked' : 'Pending Backend Sync'}
                </span>
              </div>

              {/* Milestones Timeline */}
              <div className="space-y-3 font-mono text-xs border-l-2 border-slate-700 pl-3.5 ml-1">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">1. First Ranked (Day-0 Inception)</div>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {hasInception
                      ? `${String(incep.first_ranked_at || incep.firstRankedAt).slice(0, 10)} @ ${currencySymbol}${firstPrice.toFixed(firstPrice < 1 ? 3 : 2)}`
                      : 'Pending ticker_signal_inception table sync'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">2. First [C:8]+ Conviction Alert</div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    Conviction: {incep?.first_conviction || data.conviction || 'N/A'} • Vol Mult: {volInfo.label}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">3. Lifetime Excursion (MFE % / MAE %)</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-emerald-400 font-bold">
                      Peak MFE: +{Math.max(0, mfePct).toFixed(2)}%
                    </span>
                    <span className="text-rose-400 font-bold">
                      Worst MAE: {maePct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">4. Position Entry Executed</div>
                  <div className="font-bold text-cyan-400 mt-0.5">
                    {isHolding
                      ? `${rawBoughtAt ? String(rawBoughtAt).slice(0, 10) : 'Active Ledger'} • ${units.toLocaleString()} units @ ${currencySymbol}${avgCost.toFixed(avgCost < 1 ? 3 : 2)}`
                      : 'Not currently held in active workbook ledger'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">5. Current Outcome &amp; Shield Status</div>
                  <div className="font-bold text-amber-300 mt-0.5">
                    {isHolding
                      ? `${shield.label} (${plPct >= 0 ? '+' : ''}${plPct.toFixed(2)}%)`
                      : incep?.lifecycle_status || 'WATCHLIST_DISCOVERY'}
                  </div>
                </div>
              </div>

              {/* Success / Failure Attribution Tags */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Kinematic Attribution Diagnostics
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {attributionTags.map((t, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        t.positive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: AI DOSSIER [SCHEMA:V2] & KELLY ORDER EXECUTION PAD           */}
        {/* =================================================================== */}
        {activeTab === 'DOSSIER' && (
          <>
            {/* AI Dossier ([SCHEMA:V2]) — Strictly bound to real dossier field */}
            <div className="bg-[#111827] border border-purple-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300 mb-2">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Sector Dossier ([SCHEMA:V2])</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {aiDossierText ? 'GROUNDED' : 'NO CACHED DOSSIER'}
                </span>
              </div>

              {aiDossierText ? (
                <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3 whitespace-pre-line">
                  {aiDossierText}
                </p>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed font-mono mb-3">
                  No [SCHEMA:V2] AI Dossier string is currently attached to {ticker} in this payload. Zero fabricated sector commentary is displayed. Use the AI Analyst Terminal to run a live grounded audit.
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 border-t border-purple-900/30 pt-2">
                <span>Sector: {data.sector || 'Quantitative Universe'}</span>
                <span>Rule 19 Scoped</span>
              </div>
            </div>

            {/* Kelly Criterion & Risk Sizing Calculator */}
            <KellySizingCalculator
              ticker={ticker}
              price={livePrice || 0.05}
              currency={data.currency}
              initialEquity={userEquity}
              onApplyUnits={(u) => setOrderUnits(u)}
            />

            {/* Real-Money Execution Guard */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-300/90 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Rule 24 Slippage Cap Enforced</span>
                <span className="text-[11px] text-amber-400/80 leading-normal">
                  Orders are capped at a strict +2.0% marketable limit ceiling ({currencySymbol}{(livePrice * 1.02).toFixed(livePrice < 1 ? 3 : 2)}) with minimum $500 parcel protection.
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Footer Execution Action */}
      <div className={`p-4 border-t space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
        <button
          type="button"
          onClick={() => onExecuteOrder(ticker, { ...data, price: livePrice, units: orderUnits })}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs font-mono tracking-wide shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition duration-150"
        >
          <span>
            STAGE LIMIT BUY ({orderUnits.toLocaleString()} Units @ {currencySymbol}
            {((livePrice || 0.045) * 1.02).toFixed(livePrice < 1 ? 3 : 2)} MAX CEILING)
          </span>
        </button>
      </div>
    </div>
  );
}
