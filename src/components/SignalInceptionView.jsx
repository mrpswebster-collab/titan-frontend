import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Activity,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  AlertTriangle,
  Award,
  Ban
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';

const ACTION_FILTERS = [
  { id: 'ALL', label: 'All Discovered' },
  { id: 'BOUGHT_ACTIVE', label: 'Bought & Active' },
  { id: 'WATCHED_MISSED', label: 'Watched / Missed Winner' },
  { id: 'STOPPED_FAILED', label: 'Stopped / Failed' },
  { id: 'SUSPENDED_QUARANTINED', label: 'Suspended / $0 Quarantined' }
];

// Helper: verify volume multiplier without ever faking 1.0x
export function formatVerifiedVolMult(rawVal, isVerifiedFlag) {
  const num = Number(rawVal);
  if (
    rawVal === null ||
    rawVal === undefined ||
    rawVal === '' ||
    rawVal === 'N/A' ||
    rawVal === 'UNVERIFIED' ||
    isVerifiedFlag === false ||
    isNaN(num) ||
    num <= 0 ||
    num === 1.0
  ) {
    return { verified: false, label: 'N/A · UNVERIFIED' };
  }
  return { verified: true, label: `${num.toFixed(2)}x`, value: num };
}

// Helper: compute days elapsed since an ISO or YYYY-MM-DD date string
export function computeDaysSince(dateStr) {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;
  const diffMs = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function SignalInceptionView({
  userSession,
  selectedWorkbook = 'ALL',
  onSelectTicker,
  theme = 'dark',
  compact = false
}) {
  const isLight = theme === 'light';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState('CHECKING'); // 'LIVE' | 'PENDING_BACKEND_SYNC' | 'CHECKING'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInceptionLedger = async () => {
    setLoading(true);
    try {
      const wbQuery = selectedWorkbook && selectedWorkbook !== 'ALL'
        ? `?workbook=${encodeURIComponent(selectedWorkbook)}`
        : '';
      const res = await fetch(`${API_BASE}/api/v2/portfolio/inception${wbQuery}`, {
        headers: {
          'Authorization': `Bearer ${userSession?.idToken || ''}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.inception)
            ? data.inception
            : Array.isArray(data?.records)
              ? data.records
              : [];
        setRecords(list);
        setSyncState('LIVE');
      } else {
        setRecords([]);
        setSyncState('PENDING_BACKEND_SYNC');
      }
    } catch (e) {
      setRecords([]);
      setSyncState('PENDING_BACKEND_SYNC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInceptionLedger();
  }, [userSession?.idToken, selectedWorkbook]);

  const categorizeRecord = (rec) => {
    const rawStatus = String(rec.lifecycle_status || rec.status || '').toUpperCase();
    const curPrice = Number(rec.current_price ?? rec.livePrice ?? -1);
    if (
      rawStatus.includes('SUSPEND') ||
      rawStatus.includes('QUARANTIN') ||
      rawStatus.includes('HALT') ||
      curPrice === 0
    ) {
      return 'SUSPENDED_QUARANTINED';
    }
    if (rawStatus.includes('BOUGHT') || rawStatus.includes('ACTIVE') || rawStatus.includes('OPEN') || rawStatus.includes('HOLD')) {
      return 'BOUGHT_ACTIVE';
    }
    if (rawStatus.includes('STOP') || rawStatus.includes('FAIL') || rawStatus.includes('CLOSED_LOSS')) {
      return 'STOPPED_FAILED';
    }
    if (rawStatus.includes('WATCH') || rawStatus.includes('MISS') || rawStatus.includes('SKIP')) {
      return 'WATCHED_MISSED';
    }
    return 'WATCHED_MISSED';
  };

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (selectedWorkbook !== 'ALL' && rec.workbook && rec.workbook !== selectedWorkbook) {
        return false;
      }
      const cat = categorizeRecord(rec);
      if (activeFilter !== 'ALL' && cat !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const t = String(rec.ticker || '').toLowerCase();
        const c = String(rec.company || rec.name || '').toLowerCase();
        if (!t.includes(q) && !c.includes(q)) return false;
      }
      return true;
    });
  }, [records, selectedWorkbook, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const map = {
      ALL: records.length,
      BOUGHT_ACTIVE: 0,
      WATCHED_MISSED: 0,
      STOPPED_FAILED: 0,
      SUSPENDED_QUARANTINED: 0
    };
    records.forEach((r) => {
      const c = categorizeRecord(r);
      if (map[c] !== undefined) map[c] += 1;
    });
    return map;
  }, [records]);

  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111827] border-slate-800';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-xl transition ${cardBg}`}>
      {/* Top Header & Controls */}
      <div className={`p-4 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-[#131b2e] border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className={`text-sm font-bold ${textPrimary}`}>
              Day-0 Signal Inception & Lifetime Learning Tracker
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
              syncState === 'LIVE'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {syncState === 'LIVE' ? `${records.length} Tracked` : 'Pending Backend Sync'}
            </span>
          </div>
          {!compact && (
            <p className={`text-[11px] font-mono mt-0.5 ${textMuted}`}>
              Immutable Day-0 snapshot when first ranked by Titan vs. current trajectory, MFE/MAE excursion & attribution.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono ${
            isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0b1120] border-slate-700 text-slate-200'
          }`}>
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter ticker..."
              className="bg-transparent outline-none w-28 sm:w-36 text-xs"
            />
          </div>

          <button
            type="button"
            onClick={fetchInceptionLedger}
            className={`p-1.5 px-2.5 rounded-xl text-xs flex items-center gap-1.5 font-mono transition border ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync Inception</span>
          </button>
        </div>
      </div>

      {/* Action Filter Pills */}
      <div className={`px-4 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1120] border-slate-800/80'
      }`}>
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {ACTION_FILTERS.map((f) => {
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition shrink-0 flex items-center gap-1.5 ${
                active
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : isLight
                    ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                active ? 'bg-black/20 text-slate-950' : isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-900 text-slate-400'
              }`}>
                {counts[f.id] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body: Strict API-Only Empty State or Live Table */}
      {filteredRecords.length === 0 ? (
        <div className="p-8 sm:p-10 text-center font-mono space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6 text-amber-400" />
          </div>
          <div className="max-w-xl mx-auto space-y-1.5">
            <div className={`text-sm font-bold ${textPrimary}`}>
              {syncState === 'PENDING_BACKEND_SYNC'
                ? 'Pending Backend Sync — GET /api/v2/portfolio/inception'
                : 'No Signal Inception Records Match Current Filter'}
            </div>
            <p className={`text-xs leading-relaxed font-sans ${textMuted}`}>
              Strict API-Only Mode is enforced: zero fabricated or simulated Day-0 rows are injected. Once the additive{' '}
              <code className="font-mono text-emerald-400">ticker_signal_inception</code> table is wired in{' '}
              <code className="font-mono text-cyan-400">titan-quant-system</code>, immutable Day-0 snapshots, MFE/MAE excursions, and outcome attributions will populate automatically.
            </p>
          </div>

          {/* Read-Only Additive Contract Preview Badge */}
          <div className={`max-w-2xl mx-auto rounded-xl border p-3.5 text-left text-[11px] font-mono space-y-1.5 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0b1120] border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400">
              <span>Additive Read-Only Contract (ticker_signal_inception)</span>
              <span className="text-emerald-400 font-bold">Zero-Mock Enforced</span>
            </div>
            <div className="text-[11px] text-slate-400 break-all">
              Fields: <span className="text-slate-200">first_ranked_at</span> · <span className="text-slate-200">first_price</span> ·{' '}
              <span className="text-slate-200">first_quant_score</span> · <span className="text-slate-200">first_conviction</span> ·{' '}
              <span className="text-slate-200">first_macd</span> · <span className="text-slate-200">first_vol_mult</span> ·{' '}
              <span className="text-slate-200">peak_price_since_inception (MFE)</span> · <span className="text-slate-200">low_price_since_inception (MAE)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`text-[10px] uppercase tracking-wider border-b ${
              isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#0f172a] text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">Ticker / Day-0 Ranked</th>
                <th className="py-3 px-3 text-right">Day-0 vs Live Price</th>
                <th className="py-3 px-3 text-right">Since Discovery</th>
                <th className="py-3 px-3">Day-0 First-Seen Math</th>
                <th className="py-3 px-3">Verified Vol Mult (Day-0)</th>
                <th className="py-3 px-3 text-right">Lifetime MFE / MAE</th>
                <th className="py-3 px-4">Outcome & Attribution</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {filteredRecords.map((rec) => {
                const firstPrice = Number(rec.first_price || rec.firstPrice || 0);
                const livePrice = Number(rec.current_price || rec.livePrice || 0);
                const sincePct = firstPrice > 0 && livePrice > 0
                  ? ((livePrice - firstPrice) / firstPrice) * 100
                  : Number(rec.since_discovery_pct ?? 0);
                const peakPrice = Number(rec.peak_price_since_inception || rec.peakPrice || 0);
                const lowPrice = Number(rec.low_price_since_inception || rec.lowPrice || 0);
                const mfePct = firstPrice > 0 && peakPrice > 0
                  ? ((peakPrice - firstPrice) / firstPrice) * 100
                  : Number(rec.mfe_pct ?? 0);
                const maePct = firstPrice > 0 && lowPrice > 0
                  ? ((lowPrice - firstPrice) / firstPrice) * 100
                  : Number(rec.mae_pct ?? 0);

                const volInfo = formatVerifiedVolMult(
                  rec.first_vol_mult ?? rec.vol_mult ?? rec.volMult,
                  rec.vol_verified ?? rec.is_vol_verified
                );
                const daysSince = computeDaysSince(rec.first_ranked_at || rec.firstRankedAt);
                const cat = categorizeRecord(rec);
                const tags = Array.isArray(rec.attribution_tags) ? rec.attribution_tags : [];

                return (
                  <tr
                    key={`${rec.workbook || 'WB'}-${rec.ticker}-${rec.first_ranked_at || ''}`}
                    onClick={() =>
                      onSelectTicker &&
                      onSelectTicker({
                        ...rec,
                        ticker: rec.ticker,
                        name: rec.company || rec.name || rec.ticker,
                        price: livePrice || firstPrice,
                        conviction: rec.first_conviction || rec.conviction || 'N/A',
                        currency: rec.currency || 'AUD',
                        initialDrawerTab: 'INCEPTION'
                      })
                    }
                    className={`cursor-pointer transition ${
                      isLight ? 'hover:bg-slate-100/90' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* 1. Ticker & Day-0 Timestamp */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold text-sm">{rec.ticker}</span>
                        <span className={`text-[11px] truncate max-w-[130px] ${textMuted}`}>
                          {rec.company || rec.name || '—'}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-0.5 flex items-center gap-1.5 ${textMuted}`}>
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Ranked: {rec.first_ranked_at ? String(rec.first_ranked_at).slice(0, 10) : '—'}</span>
                        {daysSince !== null && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {daysSince}d ago
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Day-0 Price vs Current Price */}
                    <td className="py-3 px-3 text-right">
                      <div className={`font-bold ${textPrimary}`}>
                        Now: ${livePrice > 0 ? livePrice.toFixed(livePrice < 1 ? 3 : 2) : '0.00'}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${textMuted}`}>
                        Day-0: ${firstPrice > 0 ? firstPrice.toFixed(firstPrice < 1 ? 3 : 2) : '—'}
                      </div>
                    </td>

                    {/* 3. Since Discovery % */}
                    <td className="py-3 px-3 text-right font-bold">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs ${
                        sincePct >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {sincePct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {sincePct >= 0 ? '+' : ''}{sincePct.toFixed(2)}%
                      </span>
                    </td>

                    {/* 4. First-Seen Day-0 Math */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {rec.first_conviction || rec.conviction || 'N/A'}
                        </span>
                        {rec.first_quant_score !== undefined && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px]">
                            QS: {Number(rec.first_quant_score).toFixed(1)}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {rec.first_macd || rec.macd || 'MACD: —'}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-1 ${textMuted}`}>
                        State: <span className="text-amber-300 font-semibold">{rec.coiled_spring_state || rec.compression_state || 'STANDARD'}</span>
                      </div>
                    </td>

                    {/* 5. Verified Vol Mult */}
                    <td className="py-3 px-3">
                      {volInfo.verified ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          volInfo.value >= 1.5
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {volInfo.label} VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {volInfo.label}
                        </span>
                      )}
                    </td>

                    {/* 6. Lifetime MFE / MAE */}
                    <td className="py-3 px-3 text-right">
                      <div className="text-emerald-400 font-bold text-[11px]">
                        MFE: +{Math.max(0, mfePct).toFixed(1)}%
                      </div>
                      <div className="text-rose-400 text-[10px] mt-0.5">
                        MAE: {maePct.toFixed(1)}%
                      </div>
                    </td>

                    {/* 7. Lifecycle Status & Attribution */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          cat === 'BOUGHT_ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                            : cat === 'WATCHED_MISSED'
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                              : cat === 'SUSPENDED_QUARANTINED'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                        }`}>
                          {cat.replace('_', ' ')}
                        </span>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
