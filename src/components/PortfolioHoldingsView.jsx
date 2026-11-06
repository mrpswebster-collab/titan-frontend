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
  Sliders,
  PlusCircle,
  Cpu,
  Settings2,
  Rocket,
  Terminal,
  Activity,
  Radio,
  Play,
  Bot
} from 'lucide-react';
import WorkbookAutoBuilderModal from './WorkbookAutoBuilderModal';

const API_BASE = 'https://asx-quant-brain.onrender.com';
const QUICK_CAPS = [5000, 10000, 25000, 50000, 100000, 250000];

export default function PortfolioHoldingsView({ userSession, onSelectTicker, onUpdateSession }) {
  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [workbooks, setWorkbooks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [accessTier, setAccessTier] = useState('ISOLATED_CLIENT_ENCLAVE');
  const [loading, setLoading] = useState(true);

  // Workbook Auto-Builder & Global AI Hub Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [mcpTokenData, setMcpTokenData] = useState(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [copiedMcpConfig, setCopiedMcpConfig] = useState(false);
  const [copiedCliCmd, setCopiedCliCmd] = useState(false);

  // Phase 4: Cloud Sentinel Daemon & Live Stream State
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [agentEvents, setAgentEvents] = useState([]);
  const [agentRunningAction, setAgentRunningAction] = useState('');
  const [agentActionMsg, setAgentActionMsg] = useState('');
  const [editingWorkbook, setEditingWorkbook] = useState(null);
  const [builderInitialTab, setBuilderInitialTab] = useState('WORKBOOK_BUILDER');

  // Editable Capital Calibration State (Default $5,000, 100% Isolated per Workbook)
  const [capitalInput, setCapitalInput] = useState(String(userSession?.startingCapital || 5000));
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

    // Phase 4: Cloud Sentinel Runner Handlers
  const handleOpenAgentModal = async () => {
    setIsAgentModalOpen(true);
    setAgentActionMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/v2/agent/status`);
      if (res.ok) {
        const data = await res.json();
        setAgentStatus(data);
      }
    } catch (err) {
      console.error('Failed to load agent status', err);
    }
  };

  useEffect(() => {
    if (!isAgentModalOpen) return;
    let eventSource = null;
    try {
      eventSource = new EventSource(`${API_BASE}/api/v2/agent/stream`);
      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          setAgentEvents((prev) => [parsed, ...prev.slice(0, 99)]);
        } catch (jsonErr) {}
      };
    } catch (err) {
      console.warn('SSE connection notice:', err);
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isAgentModalOpen]);

  const handleTriggerPremarket = async () => {
    setAgentRunningAction('premarket');
    setAgentActionMsg('Executing 09:15 Pre-Market Kinematic Scan across universe...');
    try {
      const token = userSession?.token || 'machine_internal';
      const res = await fetch(`${API_BASE}/api/v2/agent/run-premarket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setAgentActionMsg(`Scan Complete! Found ${data.results?.[0]?.targets_found || 0} Rule 53 Coiled Springs.`);
      const stRes = await fetch(`${API_BASE}/api/v2/agent/status`);
      if (stRes.ok) setAgentStatus(await stRes.json());
    } catch (err) {
      setAgentActionMsg('Pre-market scan trigger failed.');
    } finally {
      setAgentRunningAction('');
    }
  };

  const handleTriggerEodHarvest = async () => {
    setAgentRunningAction('eod');
    setAgentActionMsg('Executing 16:15 EOD Audit & Rule 42 Harvest...');
    try {
      const token = userSession?.token || 'machine_internal';
      const res = await fetch(`${API_BASE}/api/v2/agent/run-eod-harvest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setAgentActionMsg(`EOD Audit Complete! ${data.harvest_actions_count || 0} Rule 42 Harvests executed.`);
      const stRes = await fetch(`${API_BASE}/api/v2/agent/status`);
      if (stRes.ok) setAgentStatus(await stRes.json());
    } catch (err) {
      setAgentActionMsg('EOD audit trigger failed.');
    } finally {
      setAgentRunningAction('');
    }
  };

  const handleOpenMcpModal = async () => {
    setIsMcpModalOpen(true);
    if (mcpTokenData) return;
    setMcpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/mcp-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.idToken}`
        },
        body: JSON.stringify({
          spreadsheet_id: activeWb?.id || userSession?.spreadsheetId,
          portfolio_name: activeWb?.name || 'Primary Trading Node',
          currency: currencyInput,
          starting_capital: userSession?.startingCapital || 25000
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMcpTokenData(data);
      }
    } catch (e) {
      console.warn('Failed to fetch FastMCP token:', e);
    } finally {
      setMcpLoading(false);
    }
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
      
      {/* 1. Interactive Capital Calibration Bar (Clean $5,000 Default — Editable Anytime in UI or Config Tab) */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Isolated Workbook Cash Pool Calibration (Default $5,000)
              </h3>
              {savedNotice && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  ✓ {savedNotice}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Each workbook maintains a 100% separate cash pool. Type any custom amount below (or edit in the Sheet Config tab) at any time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Selector + Clean Custom Type-In Box */}
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
                  placeholder="5000"
                  className="w-36 bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-xl pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none"
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
                Self-Service Onboarding Active & VIP One-Time Invite Codes
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Clients onboard automatically via <strong className="text-emerald-300">Turnstile Anti-Bot + 6-digit Email OTP + 4-digit PIN</strong>. Each invite code below is an independent 1-time access pass (having 2 active means either code can be used once).
              </p>
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

      {/* 3. Multi-Workbook Fleet Command & 1-Click Auto-Builder */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                {accessTier === 'SUPERADMIN_FLEET' ? 'Multi-Workbook Fleet Command Center' : 'Your Dedicated Workbook Fleet'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Antigravity MCP + Python Direct-Push Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Each workbook can hunt a different exchange (ASX, NASDAQ, NYSE, LSE, TSX), price bracket ($0.001 Penny Coiled Springs to Blue-Chips), or dedicated stock list.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAgentModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition shadow-sm shadow-emerald-500/10"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Cloud Sentinel Daemon & Stream</span>
            </button>

            <button
              type="button"
              onClick={handleOpenMcpModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>BYO Antigravity Agent (FastMCP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingWorkbook(null);
                setBuilderInitialTab('GLOBAL_AI_HUB');
                setIsBuilderOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-200 text-xs font-bold transition"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Global AI (Antigravity MCP) & Data APIs</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingWorkbook(null);
                setBuilderInitialTab('WORKBOOK_BUILDER');
                setIsBuilderOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Dedicated Workbook</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {workbooks.map((wb) => {
            const isSelected = selectedWorkbook === wb.id;
            return (
              <div
                key={wb.id}
                onClick={() => setSelectedWorkbook(wb.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-lg'
                    : 'bg-[#0f172a] border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold truncate text-slate-100">{wb.name}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 shrink-0">
                      {wb.exchange || 'ASX'}
                    </span>
                  </div>

                  {/* Unlocked Strategy, Harvest & Catch Confluence Badges */}
                  <div className="flex flex-wrap items-center gap-1 my-1.5">
                    {wb.strategy_protocol && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {wb.strategy_protocol === 'MOONSHOT_COILED_SPRING'
                          ? '🚀 2,000% MOONSHOT'
                          : wb.strategy_protocol === 'BLUE_CHIP_CORE'
                            ? '💎 WEALTH & DIVIDEND HOLD'
                            : wb.strategy_protocol}
                      </span>
                    )}
                    {wb.min_price !== undefined && wb.id !== 'ALL' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        ${wb.min_price}–${wb.max_price >= 99999 ? ' Uncapped' : wb.max_price}
                      </span>
                    )}
                    {wb.id !== 'ALL' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {wb.harvest_mode === 'HOLD_100_COMPOUND'
                          ? '💎 Hold 100% Compound'
                          : `🏦 Harvest ${wb.harvest_recovery_pct ?? 100}% @ +${wb.harvest_trigger_gain_pct ?? 100}%`}
                      </span>
                    )}
                    {wb.catch_confluence_summary && wb.id !== 'ALL' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 truncate max-w-[200px]">
                        🎯 {wb.catch_confluence_summary}
                      </span>
                    )}
                    {wb.dedicated_tickers && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 truncate max-w-[160px]">
                        🎯 {wb.dedicated_tickers}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-slate-800/70">
                  <div>
                    <span className="text-slate-200 font-bold">
                      {wb.currency || currencyInput} ${Number(wb.equity || 0).toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                    </span>
                    <span className={`ml-2 ${wb.dayPl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}`}>
                      {wb.dayPl >= 0 ? '+' : ''}{wb.dayPlPct}%
                    </span>
                  </div>

                  {wb.id !== 'ALL' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingWorkbook(wb);
                        setBuilderInitialTab('WORKBOOK_BUILDER');
                        setIsBuilderOpen(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-200 text-[10px] font-bold transition"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>Configure Rules</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

      {/* Workbook Auto-Builder & Global AI Hub Modal */}
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
    
      {/* Track 1: BYO Antigravity Agent (FastMCP Gateway) Modal */}
      {isMcpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-[#0d131f] border border-cyan-800/60 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Track 1: Connect BYO Antigravity CLI & IDE (FastMCP)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dual-Track Hybrid Cloud • Rule 19 Zero-Trust Scoped Multi-Tenancy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMcpModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-cyan-400 block font-mono text-[11px] uppercase">
                  Zero Inference Host Cost
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your local Antigravity CLI (<code className="text-white">agy</code>) or Antigravity IDE connects directly to your scoped workbook on Render via FastMCP SSE. All reasoning executes using your own Google AI credits.
                </p>
              </div>

              {mcpLoading ? (
                <div className="py-8 text-center font-mono text-xs text-cyan-400 animate-pulse">
                  Provisioning scoped FastMCP credentials...
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 mb-1">
                      Scoped FastMCP SSE Endpoint:
                    </label>
                    <div className="p-2.5 rounded-xl bg-[#070b12] border border-slate-800 text-cyan-300 break-all select-all text-[11px]">
                      {mcpTokenData?.sse_endpoint || 'Loading endpoint...'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase text-slate-400">
                        Drop into ~/.gemini/config/mcp_config.json:
                      </label>
                      <button
                        onClick={() => {
                          if (mcpTokenData?.mcp_config_json) {
                            navigator.clipboard.writeText(JSON.stringify(mcpTokenData.mcp_config_json, null, 2));
                            setCopiedMcpConfig(true);
                            setTimeout(() => setCopiedMcpConfig(false), 2000);
                          }
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedMcpConfig ? '✓ Copied JSON' : 'Copy Snippet'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-[#05080e] border border-slate-800 text-slate-300 text-[10px] overflow-x-auto max-h-40">
                      {JSON.stringify(mcpTokenData?.mcp_config_json || {}, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase text-slate-400">
                        Or Connect with 1-Line CLI Command:
                      </label>
                      <button
                        onClick={() => {
                          if (mcpTokenData?.cli_install_command) {
                            navigator.clipboard.writeText(mcpTokenData.cli_install_command);
                            setCopiedCliCmd(true);
                            setTimeout(() => setCopiedCliCmd(false), 2000);
                          }
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedCliCmd ? '✓ Copied Command' : 'Copy Command'}</span>
                      </button>
                    </div>
                    <div className="p-2 rounded-xl bg-[#05080e] border border-slate-800 text-emerald-400 text-[11px] select-all">
                      {mcpTokenData?.cli_install_command || 'agy mcp add titan-desk --url ...'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block">Scoped Sheet:</span>
                      <span className="text-emerald-400 font-bold truncate block">{mcpTokenData?.spreadsheet_id?.slice(0, 12)}...</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block">Currency Pot:</span>
                      <span className="text-cyan-400 font-bold">{mcpTokenData?.currency} ${Number(mcpTokenData?.cash_pot || 25000).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block">Permissions:</span>
                      <span className="text-purple-300 font-bold">{mcpTokenData?.permissions?.join(', ') || 'READ, EXECUTE'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
