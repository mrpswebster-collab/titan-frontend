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
  Key,
  UserPlus,
  Copy,
  Sliders
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';
const QUICK_CAPS = [5000, 10000, 25000, 50000, 100000, 250000];

export default function PortfolioHoldingsView({ userSession, onSelectTicker, onUpdateSession }) {
  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [workbooks, setWorkbooks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [accessTier, setAccessTier] = useState('ISOLATED_CLIENT_ENCLAVE');
  const [loading, setLoading] = useState(true);

  // Editable Capital Calibration State
  const [capitalInput, setCapitalInput] = useState(String(userSession?.startingCapital || 25000));
  const [currencyInput, setCurrencyInput] = useState(userSession?.currency || 'AUD');
  const [savingCapital, setSavingCapital] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  // Superadmin Invite Code & Allowlist State
  const [inviteList, setInviteList] = useState([]);
  const [allowlistEmails, setAllowlistEmails] = useState([]);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [copiedInvite, setCopiedInvite] = useState('');

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

  const fetchAdminSecurityList = async () => {
    if (!userSession?.isAdmin || !userSession?.idToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/v2/admin/invite-codes`, {
        headers: { 'Authorization': `Bearer ${userSession.idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInviteList(data.active_invites || []);
        setAllowlistEmails(data.allowlisted_emails || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchFleetData();
    fetchAdminSecurityList();
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
      setSavedNotice(`Updated capital pool to ${currencyInput} $${num.toLocaleString()}`);
      fetchFleetData();
      setTimeout(() => setSavedNotice(''), 3000);
    } catch (e) {
      console.warn('Save capital notice:', e);
    } finally {
      setSavingCapital(false);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v2/admin/invite-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.idToken}`
        },
        body: JSON.stringify({ label: 'Institutional Client Invite' })
      });
      if (res.ok) {
        const data = await res.json();
        setInviteList(data.active_invites || []);
      }
    } catch (e) {}
  };

  const handleAddAllowlistEmail = async (e) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/v2/admin/allowlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.idToken}`
        },
        body: JSON.stringify({ email: newEmailInput.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setAllowlistEmails(data.allowlisted_emails || []);
        setNewEmailInput('');
      }
    } catch (e) {}
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. Interactive Capital Calibration Bar (Select Preset or Type Any Value) */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Capital Pool & Position Sizing Calibration
              </h3>
              {savedNotice && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  ✓ {savedNotice}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select a preset below or type in any custom capital amount to calibrate your sheet & Kelly sizing calculator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick-Select Preset Pills */}
            <div className="flex items-center gap-1 bg-[#0a0e17] p-1 rounded-xl border border-slate-800">
              {QUICK_CAPS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSaveCustomCapital(amt)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                    Number(capitalInput) === amt
                      ? 'bg-emerald-500 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ${amt / 1000}k
                </button>
              ))}
            </div>

            {/* Currency Selector + Custom Type-In Box */}
            <div className="flex items-center gap-1.5">
              <select
                value={currencyInput}
                onChange={(e) => setCurrencyInput(e.target.value)}
                className="bg-[#0a0e17] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white outline-none"
              >
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>

              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs font-mono text-slate-400">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="Custom amount"
                  className="w-32 bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-xl pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSaveCustomCapital()}
                disabled={savingCapital}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition"
              >
                {savingCapital ? 'Saving...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUPERADMIN ONLY: Client Invite Code & Allowlist Enclave Manager */}
      {userSession?.isAdmin && (
        <div className="bg-[#111827] border border-emerald-800/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                SUPERADMIN ENCLAVE CONTROLS
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                Institutional Client Allowlist & One-Time Invite Code Generator
              </h3>
            </div>
            <button
              onClick={handleGenerateInvite}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Generate 1-Time Client Invite Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct Email Allowlist Form */}
            <form onSubmit={handleAddAllowlistEmail} className="bg-[#0a0e17] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <label className="block text-[10px] font-mono uppercase text-slate-400">
                Pre-Approve Client Google Email (Direct Allowlist)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="client@gmail.com"
                  className="flex-1 bg-[#111827] border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              </div>
              {allowlistEmails.length > 0 && (
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Approved Clients: <span className="text-emerald-400">{allowlistEmails.join(', ')}</span>
                </div>
              )}
            </form>

            {/* Generated Invite Codes */}
            <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="block text-[10px] font-mono uppercase text-slate-400">
                Active One-Time Invite Codes ({inviteList.filter(i => !i.used).length} available)
              </span>
              {inviteList.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 py-1">
                  Click "Generate 1-Time Client Invite Code" to issue an onboarding code.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {inviteList.map(inv => (
                    <button
                      key={inv.code}
                      onClick={() => {
                        navigator.clipboard.writeText(inv.code);
                        setCopiedInvite(inv.code);
                        setTimeout(() => setCopiedInvite(''), 2000);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                        inv.used
                          ? 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                          : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                      }`}
                    >
                      <span>{inv.code}</span>
                      <Copy className="w-3 h-3" />
                      {copiedInvite === inv.code && <span className="text-[10px] text-white">Copied!</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Workbook Selector Pills */}
      {workbooks.length > 1 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                {accessTier === 'SUPERADMIN_FLEET' ? 'Superadmin 8-Workbook Fleet Selector' : 'Connected Trading Sheets'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {workbooks.map((wb) => {
              const isSelected = selectedWorkbook === wb.id;
              return (
                <button
                  key={wb.id}
                  onClick={() => setSelectedWorkbook(wb.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-lg'
                      : 'bg-[#0f172a] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold truncate pr-2 text-slate-100">{wb.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{wb.exchange}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono mt-2">
                    <span className="text-slate-300 font-bold">
                      ${wb.equity.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={wb.dayPl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {wb.dayPl >= 0 ? '+' : ''}{wb.dayPlPct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Net Equity</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {currencyInput} ${activeWb.equity.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-2">
            Active Node: {activeWb.name}
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Available Cash Pool</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {currencyInput} ${activeWb.cash.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Kelly Fraction: {userSession?.kellyFraction || 0.50}x
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Deployed Market Value</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {currencyInput} ${investedValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Across {filteredHoldings.length} open positions
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Enclave Protection</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>HMAC-SHA256 Bound</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Rule 24 & {userSession?.chaseLimitPct || 2.0}% Chase Cap Active
          </div>
        </div>
      </div>

      {/* 5. Open Positions Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#131b2e]">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Active Portfolio Holdings — {activeWb.name}</span>
            </h2>
          </div>
          <button
            onClick={fetchFleetData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {filteredHoldings.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-slate-400 space-y-2">
            <div>No open positions in this sheet yet.</div>
            <div className="text-emerald-400">
              Available Capital Pool: {currencyInput} ${activeWb.cash.toLocaleString('en-AU', { minimumFractionDigits: 2 })} ready for deployment.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0f172a] text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticker / Company</th>
                  <th className="py-3 px-4">Workbook</th>
                  <th className="py-3 px-4 text-right">Units</th>
                  <th className="py-3 px-4 text-right">Avg Entry</th>
                  <th className="py-3 px-4 text-right">Live Price</th>
                  <th className="py-3 px-4 text-right">Market Value</th>
                  <th className="py-3 px-4 text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 text-right">Stop Loss</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHoldings.map((pos) => (
                  <tr
                    key={`${pos.workbook}-${pos.ticker}`}
                    onClick={() => onSelectTicker && onSelectTicker(pos)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-sm">{pos.ticker}</span>
                        <span className="text-[11px] text-slate-400 font-normal truncate max-w-[140px]">{pos.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{pos.workbook}</td>
                    <td className="py-3 px-4 text-right text-slate-200">{pos.units.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-400">${pos.avgCost.toFixed(pos.avgCost < 1 ? 3 : 2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">${pos.livePrice.toFixed(pos.livePrice < 1 ? 3 : 2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">${pos.marketValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={pos.plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {pos.plDollar >= 0 ? '+' : ''}${pos.plDollar.toLocaleString()} ({pos.plPct >= 0 ? '+' : ''}{pos.plPct.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400">${pos.stopLoss.toFixed(pos.stopLoss < 1 ? 3 : 2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {pos.status}
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
