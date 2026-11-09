import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  Database,
  RefreshCw,
  Sliders,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';

export default function PortfolioHoldingsView({ 
  userSession, 
  onSelectTicker, 
  onUpdateSession,
  onNavigateToFleetSetup,
  theme = 'dark'
}) {
  const isLight = theme === 'light';
  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
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
  const filteredHoldings = selectedWorkbook === 'ALL'
    ? holdings
    : holdings.filter(h => h.workbook === selectedWorkbook);

  const investedValue = Math.max(0, activeWb.equity - activeWb.cash);

  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111827] border-slate-800';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. Direct Banner to Fleet & Setup Menu */}
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
              Multi-Workbook management, VIP invite codes, Cloud Sentinel daemons, and FastMCP developer keys are managed in the dedicated <strong>Fleet & Setup</strong> menu.
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

      {/* 2. Workbook Filter Pills */}
      {workbooks.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className={`text-xs font-mono font-bold uppercase shrink-0 ${textMuted}`}>
            Filter Ledger:
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
      )}

      {/* 3. Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Net Equity</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${textPrimary}`}>
            {currencyInput} ${Number(activeWb.equity || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Node: {activeWb.name}</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[11px] font-mono text-slate-400 uppercase">Available Cash Pool</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {currencyInput} ${Number(activeWb.cash || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Kelly Fraction: {userSession?.kellyFraction || 0.50}x
          </div>
        </div>

        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[11px] font-mono text-slate-400 uppercase">Deployed Market Value</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {currencyInput} ${investedValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Across {filteredHoldings.length} open position{filteredHoldings.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 transition ${cardBg}`}>
          <div className="text-[11px] font-mono text-slate-400 uppercase">Risk Engine Status</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Law 0 Enforced</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Rule 24 2% Slippage Cap Active
          </div>
        </div>
      </div>

      {/* 4. Open Positions Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-xl transition ${cardBg}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#131b2e] border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <h2 className={`text-sm font-bold ${textPrimary}`}>
              Active Holdings & Trailing Stops — {activeWb.name}
            </h2>
          </div>
          <button
            onClick={fetchFleetData}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-mono transition border ${
              isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {filteredHoldings.length === 0 ? (
          <div className="p-10 text-center font-mono text-xs space-y-2">
            <div className={textMuted}>No open positions in this ledger currently.</div>
            <div className="text-emerald-400 font-bold">
              Available Cash Pool: {currencyInput} ${Number(activeWb.cash || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })} ready for staged deployment.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`text-[10px] uppercase tracking-wider border-b ${isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-[#0f172a] text-slate-400 border-slate-800'}`}>
                <tr>
                  <th className="py-3 px-4">Ticker / Company</th>
                  <th className="py-3 px-4">Workbook Node</th>
                  <th className="py-3 px-4 text-right">Units</th>
                  <th className="py-3 px-4 text-right">Avg Entry</th>
                  <th className="py-3 px-4 text-right">Live Price</th>
                  <th className="py-3 px-4 text-right">Market Value</th>
                  <th className="py-3 px-4 text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 text-right">Stop Loss</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                {filteredHoldings.map((pos) => (
                  <tr
                    key={`${pos.workbook}-${pos.ticker}`}
                    onClick={() => onSelectTicker && onSelectTicker(pos)}
                    className={`cursor-pointer transition ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/40'}`}
                  >
                    <td className="py-3 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-sm">{pos.ticker}</span>
                        <span className={`text-[11px] font-normal truncate max-w-[140px] ${textMuted}`}>{pos.company}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-[11px] ${textMuted}`}>{pos.workbook}</td>
                    <td className={`py-3 px-4 text-right ${textPrimary}`}>{Number(pos.units || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-400">${Number(pos.avgCost || 0).toFixed(pos.avgCost < 1 ? 3 : 2)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${textPrimary}`}>${Number(pos.livePrice || 0).toFixed(pos.livePrice < 1 ? 3 : 2)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${textPrimary}`}>${Number(pos.marketValue || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={pos.plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {pos.plDollar >= 0 ? '+' : ''}${Number(pos.plDollar || 0).toLocaleString()} ({pos.plPct >= 0 ? '+' : ''}{Number(pos.plPct || 0).toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400 font-bold">${Number(pos.stopLoss || 0).toFixed(pos.stopLoss < 1 ? 3 : 2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {pos.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
