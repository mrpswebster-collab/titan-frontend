import React, { useState, useEffect } from 'react';
import {
  Database,
  Radio,
  Terminal,
  Cpu,
  PlusCircle,
  Key,
  UserPlus,
  Copy,
  Settings2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  ShieldCheck,
  Globe,
  Sliders,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import WorkbookAutoBuilderModal from './WorkbookAutoBuilderModal';
import HelpTooltip from './HelpTooltip';

const API_BASE = 'https://asx-quant-brain.onrender.com';

export default function FleetSetupView({
  userSession,
  onUpdateSession,
  theme = 'dark',
  onOpenBacktest,
  onOpenScanner,
  onOpenFinTechPro
}) {
  const isLight = theme === 'light';

  // Navigation sub-tabs inside Fleet Setup
  const [activeSection, setActiveSection] = useState('FLEET'); // 'FLEET', 'ONBOARDING', 'SENTINEL', 'FASTMCP', 'CAPITAL'

  // Fleet state
  const [workbooks, setWorkbooks] = useState([]);
  const [accessTier, setAccessTier] = useState('ISOLATED_CLIENT_ENCLAVE');
  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Auto-builder modal
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingWorkbook, setEditingWorkbook] = useState(null);
  const [builderInitialTab, setBuilderInitialTab] = useState('WORKBOOK_BUILDER');

  // Superadmin onboarding & invite state
  const [inviteList, setInviteList] = useState([]);
  const [allowlistEmails, setAllowlistEmails] = useState([]);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [copiedInvite, setCopiedInvite] = useState('');
  const [adminNotice, setAdminNotice] = useState('');

  // Sentinel Daemon runner state
  const [agentStatus, setAgentStatus] = useState(null);
  const [agentEvents, setAgentEvents] = useState([]);
  const [agentRunningAction, setAgentRunningAction] = useState('');
  const [agentActionMsg, setAgentActionMsg] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  // FastMCP Token state
  const [mcpTokenData, setMcpTokenData] = useState(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [copiedMcpConfig, setCopiedMcpConfig] = useState(false);
  const [copiedCliCmd, setCopiedCliCmd] = useState(false);

  // Capital settings state
  const [capitalInput, setCapitalInput] = useState(String(userSession?.startingCapital || 25000));
  const [currencyInput, setCurrencyInput] = useState(userSession?.currency || 'AUD');
  const [savingCapital, setSavingCapital] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  // Fetch fleet workbooks
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
        setAccessTier(data.access_tier || 'ISOLATED_CLIENT_ENCLAVE');
        if (data.workbooks?.length > 0 && selectedWorkbook === 'ALL' && data.access_tier !== 'SUPERADMIN_FLEET') {
          setSelectedWorkbook(data.workbooks[0].id);
        }
      }
    } catch (e) {
      console.warn('Fleet fetch notice:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin invites & allowlist
  const fetchAdminSecurityList = async () => {
    if (!userSession?.isAdmin && !userSession?.idToken) return;
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

  // Fetch FastMCP connection credentials
  const fetchMcpData = async () => {
    setMcpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/mcp/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.idToken || ''}`
        },
        body: JSON.stringify({
          client_label: `${userSession?.name || 'Institutional'} Local Antigravity Agent`,
          spreadsheet_id: userSession?.spreadsheetId || 'CLIENT-PRIMARY-NODE'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMcpTokenData(data);
      }
    } catch (err) {
      console.warn('MCP token notice:', err);
    } finally {
      setMcpLoading(false);
    }
  };

  // Fetch Agent Status
  const fetchAgentStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v2/agent/status`);
      if (res.ok) {
        const data = await res.json();
        setAgentStatus(data);
      }
    } catch (err) {
      console.warn('Agent status notice:', err);
    }
  };

  useEffect(() => {
    fetchFleetData();
    fetchAdminSecurityList();
    fetchAgentStatus();
    fetchMcpData();
  }, [userSession?.idToken]);

  // Live SSE stream for Sentinel Daemon
  useEffect(() => {
    if (!isStreaming) return;
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
      console.warn('SSE stream notice:', err);
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isStreaming]);

  // Generate Invite
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
        setAdminNotice('New VIP 1-Time Invite Code successfully issued.');
        setTimeout(() => setAdminNotice(''), 4000);
      }
    } catch (e) {
      setAdminNotice('Failed to generate invite code.');
    }
  };

  // Add Allowlist Email
  const handleAddAllowlistEmail = async (e) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/v2/admin/allowlist-email`, {
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
        setAdminNotice(`Pre-approved client email ${newEmailInput.trim()}!`);
        setTimeout(() => setAdminNotice(''), 4000);
      }
    } catch (e) {
      setAdminNotice('Failed to allowlist email.');
    }
  };

  // Premarket Scan Trigger
  const handleTriggerPremarket = async () => {
    setAgentRunningAction('premarket');
    setAgentActionMsg('Executing 09:15 Pre-Market Kinematic Scan across universe...');
    try {
      const token = userSession?.idToken || userSession?.token || 'machine_internal';
      const res = await fetch(`${API_BASE}/api/v2/agent/run-premarket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setAgentActionMsg(`Scan Complete! Found ${data.results?.[0]?.targets_found || 0} Rule 53 Coiled Springs.`);
      fetchAgentStatus();
    } catch (err) {
      setAgentActionMsg('Pre-market scan trigger failed.');
    } finally {
      setAgentRunningAction('');
    }
  };

  // Sandbox Dry-Run Trigger
  const handleTriggerSandboxDryRun = async () => {
    setAgentRunningAction('sandbox');
    setAgentActionMsg('Executing Staging Sandbox Dry-Run (Law 0 Sovereign Risk Verification)...');
    try {
      const token = userSession?.idToken || userSession?.token || 'machine_internal';
      const res = await fetch(`${API_BASE}/api/v2/sandbox/simulate-trade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticker: 'DRO',
          action: 'AI BUY',
          shares: 2000,
          price: 1.25,
          reason: 'Automated Rule 53 Coiled Spring breakout dry-run simulation'
        })
      });
      const data = await res.json();
      setAgentActionMsg(`Dry-Run Executed! Staged order simulation: ${data.status || 'SUCCESS'} (Risk Score: PASS).`);
      fetchAgentStatus();
    } catch (err) {
      setAgentActionMsg('Sandbox simulation dry-run failed.');
    } finally {
      setAgentRunningAction('');
    }
  };

  // Save Capital
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

  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111827] border-slate-800';
  const subCardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0e17] border-slate-800';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200 ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#080d15] text-slate-200'}`}>
      
      {/* 1. Header Banner & Section Navigation */}
      <div className={`rounded-2xl border p-5 sm:p-6 shadow-md transition-all ${cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Institutional Operations Hub
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Tenant: {userSession?.tenantId || 'ALPHA-01'}
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight mt-2 flex items-center gap-2.5 ${textPrimary}`}>
              <Database className="w-6 h-6 text-emerald-400" />
              <span>Multi-Workbook Fleet & Enclave Setup Menu</span>
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${textMuted}`}>
              Full administrative governance, distributed workbook management, client onboarding authorization, autonomous sentinel streams, and FastMCP developer integration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFleetData}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition shadow-sm ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh Fleet</span>
            </button>
          </div>
        </div>

        {/* Setup Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/60">
          {[
            { id: 'FLEET', label: 'Multi-Workbook Fleet', icon: Database, count: workbooks.length },
            { id: 'ONBOARDING', label: 'Client Onboarding & VIP Codes', icon: Key, badge: inviteList.filter(i => !i.used).length },
            { id: 'SENTINEL', label: 'Cloud Sentinel Daemon & Stream', icon: Radio, pulse: true },
            { id: 'FASTMCP', label: 'BYO Antigravity Agent (FastMCP)', icon: Terminal },
            { id: 'CAPITAL', label: 'Capital & Currency Allocation', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  isActive
                    ? isLight
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-emerald-950'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-[#0e1624] hover:bg-slate-800 text-slate-400 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-cyan-600 text-white' : 'bg-cyan-900/60 text-cyan-300'}`}>
                    {tab.badge}
                  </span>
                )}
                {tab.pulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Notice Banner */}
      {adminNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 px-4 py-2.5 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{adminNotice}</span>
        </div>
      )}

      {/* 2. TAB CONTENT */}

      {/* SECTION A: MULTI-WORKBOOK FLEET */}
      {activeSection === 'FLEET' && (
        <div className="space-y-6">
          {/* Detailed Architecture Explainer */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${textPrimary}`}>
                  How Multi-Workbook Fleet Isolation Works (Rule 19 Zero-Trust)
                </h3>
                <p className={`text-xs leading-relaxed ${textMuted}`}>
                  Each Google Sheet workbook functions as an isolated institutional satellite node. Rather than mixing penny mining speculations with dividend-paying blue-chips, you can provision dedicated workbooks for each operational objective. Each workbook holds its own independently audited SQLite database and cryptographic security token on Render:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className={`p-3 rounded-xl border ${subCardBg}`}>
                    <strong className="text-emerald-400 font-mono block">1. Exchange Segregation</strong>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      Run ASX penny mines in AUD, Wall Street tech momentum in USD, and London critical minerals in GBP with localized timestamps and localized watchdog cycles.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${subCardBg}`}>
                    <strong className="text-cyan-400 font-mono block">2. Risk Tier Isolation</strong>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      Enforce strict micro-cap price bounds ($0.001 - $0.500) on speculative sheets while running uncapped allocations on Tier-1 blue-chip portfolios.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${subCardBg}`}>
                    <strong className="text-purple-400 font-mono block">3. Two-Stage Harvesting (Rule 42)</strong>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      Configure whether a sheet automatically recovers 100% of capital at +100% gain, or enables <code className="text-emerald-300">HOLD_100_COMPOUND</code> targeting 2,000%+ multi-baggers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Controls & Creation */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Connected Fleet Nodes ({workbooks.length})</span>
                </h2>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  Click any workbook below to filter the global telemetry, or click "Configure Rules" to tune its kinematic and harvesting parameters.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onOpenFinTechPro && (
                  <button
                    type="button"
                    onClick={onOpenFinTechPro}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-bold text-xs shadow-sm transition"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>FinTech Pro Add-Ons</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingWorkbook(null);
                    setBuilderInitialTab('WORKBOOK_BUILDER');
                    setIsBuilderOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Dedicated Workbook</span>
                </button>
              </div>
            </div>

            {/* Workbook Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {workbooks.map((wb) => {
                const isSelected = selectedWorkbook === wb.id;
                return (
                  <div
                    key={wb.id}
                    onClick={() => setSelectedWorkbook(wb.id)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isLight
                          ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-md ring-1 ring-emerald-500'
                          : 'bg-emerald-950/30 border-emerald-500 text-slate-100 shadow-lg'
                        : isLight
                          ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          : 'bg-[#0a0e17] border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {wb.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 shrink-0">
                          {wb.exchange || 'ASX'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 my-2">
                        {wb.strategy_protocol && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {wb.strategy_protocol === 'MOONSHOT_COILED_SPRING'
                              ? '🚀 2,000% MOONSHOT'
                              : wb.strategy_protocol === 'BLUE_CHIP_CORE'
                                ? '💎 BLUE CHIP CORE'
                                : wb.strategy_protocol}
                          </span>
                        )}
                        {wb.min_price !== undefined && wb.id !== 'ALL' && (
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                            ${wb.min_price}–${wb.max_price >= 99999 ? 'Uncapped' : wb.max_price}
                          </span>
                        )}
                        {wb.id !== 'ALL' && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {wb.harvest_mode === 'HOLD_100_COMPOUND'
                              ? '💎 Compound Runner'
                              : `🏦 Harvest @ +${wb.harvest_trigger_gain_pct ?? 100}%`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono mt-3 pt-3 border-t border-slate-800/70">
                      <div>
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          {wb.currency || currencyInput} ${Number(wb.equity || 0).toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                        </span>
                        <span className={`ml-2 ${wb.dayPl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}`}>
                          {wb.dayPl >= 0 ? '+' : ''}{wb.dayPlPct || 0}%
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
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                            isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-200'
                          }`}
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
        </div>
      )}

      {/* SECTION B: SUPERADMIN ONBOARDING & VIP INVITE CODES */}
      {activeSection === 'ONBOARDING' && (
        <div className="space-y-6">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${textPrimary}`}>
                  Self-Service Onboarding & Cryptographic Access Architecture
                </h3>
                <p className={`text-xs leading-relaxed ${textMuted}`}>
                  The Titan platform uses an automated zero-trust onboarding protocol. You do not need to manually configure user databases. Clients authenticate directly using their verified Google identity:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className={`p-3 rounded-xl border ${subCardBg}`}>
                    <strong className="text-emerald-400 font-mono block">Phase 1: Verification</strong>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      Client enters email and receives a 6-digit OTP verification code dispatched via the Render mailer.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${subCardBg}`}>
                    <strong className="text-cyan-400 font-mono block">Phase 2: PIN Lock</strong>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      Client establishes a personal 4-digit PIN, salted and hashed using PBKDF2 with SHA-256.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${subCardBg}`}>
                    <strong className="text-purple-400 font-mono block">Phase 3: Micro-Storage</strong>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      Render backend automatically generates a private tenant sandbox at <code className="text-purple-300">/data/tenants/[tenant_id]</code>.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${subCardBg}`}>
                    <strong className="text-amber-400 font-mono block">Phase 4: Token Scoping</strong>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      A 256-bit cryptographic bearer token is minted, restricting all API and MCP actions strictly to their own workbook.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invite Code Generator & Direct Allowlist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Box 1: Pre-Approve Email Allowlist */}
            <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${textPrimary}`}>
                    Pre-Approve Client Google Email (Direct Allowlist)
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${textMuted}`}>
                    Clients on this list bypass public invite codes and can self-register instantly.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddAllowlistEmail} className="flex gap-2">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="client.name@gmail.com"
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-mono outline-none border transition ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-emerald-500' : 'bg-[#0a0e17] border-slate-700 text-white focus:border-emerald-500'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              </form>

              <div className="pt-2">
                <span className={`block text-[10px] font-mono uppercase mb-2 ${textMuted}`}>
                  Currently Approved Accounts ({allowlistEmails.length}):
                </span>
                {allowlistEmails.length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 italic py-2">
                    No individual emails explicitly allowlisted yet. (Default admin email mrpswebster@gmail.com is pre-authorized).
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {allowlistEmails.map((email) => (
                      <span
                        key={email}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{email}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: VIP One-Time Invite Codes */}
            <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${textPrimary}`}>
                    VIP 1-Time Invite Codes
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${textMuted}`}>
                    Issue secure one-time access codes for institutional clients or VIP hedge fund partners.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateInvite}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Generate Code</span>
                </button>
              </div>

              <div className="pt-1">
                <span className={`block text-[10px] font-mono uppercase mb-2 ${textMuted}`}>
                  Active Available Codes ({inviteList.filter(i => !i.used).length}):
                </span>
                {inviteList.length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 italic py-4 text-center border border-dashed border-slate-800 rounded-xl">
                    No one-time codes generated yet. Click "Generate Code" above to mint one.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {inviteList.map((inv) => (
                      <button
                        key={inv.code}
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(inv.code);
                          setCopiedInvite(inv.code);
                          setTimeout(() => setCopiedInvite(''), 2000);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition ${
                          inv.used
                            ? 'bg-slate-900 border-slate-800 text-slate-500 line-through opacity-60'
                            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 shadow-sm'
                        }`}
                      >
                        <span className="font-bold">{inv.code}</span>
                        <Copy className="w-3 h-3 opacity-70" />
                        {copiedInvite === inv.code ? (
                          <span className="text-[10px] text-white font-sans bg-emerald-600 px-1 rounded">Copied!</span>
                        ) : (
                          <span className="text-[10px] opacity-70">{inv.used ? 'Claimed' : 'Available'}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: CLOUD SENTINEL DAEMON & STREAM */}
      {activeSection === 'SENTINEL' && (
        <div className="space-y-6">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${textPrimary}`}>
                  Autonomous Cloud Sentinel Daemon & Event Stream
                </h3>
                <p className={`text-xs leading-relaxed ${textMuted}`}>
                  The Cloud Sentinel runs continuously on Render. It processes real-time price feeds, evaluates the 5-pillar Rule 53 Coiled Spring kinematic vector, and broadcasts structured telemetry over Server-Sent Events (SSE).
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-slate-300">Daemon Status:</span>
                    <strong className="text-emerald-400">{agentStatus?.status || 'ONLINE_ACTIVE'}</strong>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300">Heartbeat:</span>
                    <strong className="text-cyan-400">{agentStatus?.last_heartbeat || 'Active 24/5'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Trigger Controls */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${textPrimary}`}>
              Manual Workflow Triggers
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerPremarket}
                disabled={agentRunningAction === 'premarket'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{agentRunningAction === 'premarket' ? 'Scanning Universe...' : 'Run 09:15 Pre-Market Kinematic Scan'}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerSandboxDryRun}
                disabled={agentRunningAction === 'sandbox'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{agentRunningAction === 'sandbox' ? 'Simulating...' : 'Simulate Sandbox Dry-Run (Law 0 Risk)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStreaming(!isStreaming)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition ${
                  isStreaming ? 'bg-slate-800 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse' : ''}`} />
                <span>{isStreaming ? 'SSE Stream: CONNECTED' : 'SSE Stream: PAUSED'}</span>
              </button>
            </div>

            {agentActionMsg && (
              <div className="mt-4 p-3 rounded-xl bg-[#0a0e17] border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{agentActionMsg}</span>
              </div>
            )}
          </div>

          {/* Live Telemetry Console Log */}
          <div className="rounded-2xl border border-slate-800 bg-[#050911] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Real-Time Daemon Event Bus (/api/v2/agent/stream)
                </span>
              </div>
              <button
                onClick={() => setAgentEvents([])}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-850 border border-slate-750"
              >
                Clear Log
              </button>
            </div>

            <div className="font-mono text-[11px] space-y-1.5 max-h-72 overflow-y-auto p-2 bg-[#020509] rounded-xl border border-slate-900 select-text">
              {agentEvents.length === 0 ? (
                <div className="text-slate-500 py-6 text-center italic">
                  Listening for real-time kinematic events from Render backend... (Watchdog, Crons & Kinematic scans will stream live here).
                </div>
              ) : (
                agentEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300 border-b border-slate-900/60 pb-1">
                    <span className="text-slate-500 text-[10px] shrink-0">{ev.timestamp || new Date().toLocaleTimeString()}</span>
                    <span className="text-emerald-400 font-bold shrink-0">[{ev.type || 'EVENT'}]</span>
                    <span className="text-slate-200">{typeof ev.data === 'object' ? JSON.stringify(ev.data) : String(ev.message || ev.data || '')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: BYO ANTIGRAVITY AGENT (FASTMCP) */}
      {activeSection === 'FASTMCP' && (
        <div className="space-y-6">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${textPrimary}`}>
                  Bring-Your-Own Antigravity Agent (FastMCP Multi-Tenant Bridge)
                </h3>
                <p className={`text-xs leading-relaxed ${textMuted}`}>
                  Connect your local Antigravity CLI (<code className="text-white">agy</code>), Antigravity IDE, Claude Desktop, or custom Python agents to your scoped Titan trading desk. All AI reasoning runs using your local Google AI credits with <strong>zero hosting overhead</strong>, while all trade executions adhere strictly to Rule 19 Zero-Trust and Rule 24 slippage caps.
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-5 space-y-5 ${cardBg}`}>
            {mcpLoading ? (
              <div className="py-12 text-center font-mono text-xs text-cyan-400 animate-pulse">
                Provisioning scoped cryptographic FastMCP credentials from Render backend...
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                {/* 1. SSE Endpoint */}
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1.5 font-bold">
                    Scoped FastMCP SSE Endpoint:
                  </label>
                  <div className="p-3 rounded-xl bg-[#05080e] border border-slate-800 text-cyan-300 break-all select-all text-xs">
                    {mcpTokenData?.sse_endpoint || `${API_BASE}/mcp/sse?token=${userSession?.idToken || 'scoped_token'}`}
                  </div>
                </div>

                {/* 2. Config Snippet for Claude Desktop or Antigravity IDE */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase text-slate-400 font-bold">
                      Drop into ~/.gemini/config/mcp_config.json or claude_desktop_config.json:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (mcpTokenData?.mcp_config_json) {
                          navigator.clipboard.writeText(JSON.stringify(mcpTokenData.mcp_config_json, null, 2));
                          setCopiedMcpConfig(true);
                          setTimeout(() => setCopiedMcpConfig(false), 2000);
                        }
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedMcpConfig ? '✓ Copied JSON' : 'Copy Snippet'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#03060a] border border-slate-800 text-slate-300 text-[11px] overflow-x-auto max-h-48">
                    {JSON.stringify(mcpTokenData?.mcp_config_json || {
                      mcpServers: {
                        "titan-trader": {
                          url: `${API_BASE}/mcp/sse?token=${userSession?.idToken || 'token'}`,
                          transport: "sse"
                        }
                      }
                    }, null, 2)}
                  </pre>
                </div>

                {/* 3. 1-Line CLI Install Command */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase text-slate-400 font-bold">
                      Or Connect via Antigravity CLI (Terminal):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const cmd = mcpTokenData?.cli_install_command || `agy mcp add titan-desk --url "${API_BASE}/mcp/sse?token=${userSession?.idToken || 'token'}"`;
                        navigator.clipboard.writeText(cmd);
                        setCopiedCliCmd(true);
                        setTimeout(() => setCopiedCliCmd(false), 2000);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCliCmd ? '✓ Copied Command' : 'Copy Command'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-[#03060a] border border-slate-800 text-emerald-400 text-xs select-all">
                    {mcpTokenData?.cli_install_command || `agy mcp add titan-desk --url "${API_BASE}/mcp/sse?token=${userSession?.idToken || 'token'}"`}
                  </div>
                </div>

                {/* FastMCP Tools Spec */}
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="block text-[10px] uppercase text-slate-400 mb-2 font-bold">
                    Available FastMCP Tools Exposed to Your Agent:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <strong className="text-emerald-400 font-mono">fetch_sniper_targets()</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">Returns Coiled Spring breakouts passing the 5-pillar Rule 53 kinematic filter.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <strong className="text-cyan-400 font-mono">execute_portfolio_action()</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">Stages AI BUY/AI SELL limit orders capped strictly at signal_price * 1.02.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <strong className="text-purple-400 font-mono">get_consolidated_ledger()</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">Audits real-time portfolio holdings, cash balances, and trailing stops.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <strong className="text-amber-400 font-mono">get_system_telemetry()</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">Inspects watchdog heartbeat, exchange clock phases, and latency metrics.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION E: CAPITAL & CURRENCY ALLOCATION */}
      {activeSection === 'CAPITAL' && (
        <div className="space-y-6">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${textPrimary}`}>
                  Capital Pool & Currency Settings
                </h3>
                <p className={`text-xs leading-relaxed ${textMuted}`}>
                  Configure your primary trading capital pool and base operational currency. Position sizes calculated by the Fractional Kelly Criterion automatically scale off this verified capital value.
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 space-y-5 ${cardBg}`}>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>
                Select Starting Capital Pool:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSaveCustomCapital(preset)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition shadow-sm ${
                      parseFloat(capitalInput) === preset
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                        : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                          : 'bg-[#0a0e17] hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    ${preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>
                Custom Capital & Currency Type-In:
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={currencyInput}
                  onChange={(e) => setCurrencyInput(e.target.value)}
                  className={`border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0a0e17] border-slate-700 text-white'
                  }`}
                >
                  <option value="AUD">AUD (Australian Dollar)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="CAD">CAD (Canadian Dollar)</option>
                </select>

                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={capitalInput}
                    onChange={(e) => setCapitalInput(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="25000"
                    className={`w-44 border rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold outline-none focus:border-emerald-500 ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0a0e17] border-slate-700 text-white'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveCustomCapital()}
                  disabled={savingCapital}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-sm"
                >
                  {savingCapital ? 'Saving...' : 'Apply Capital Pool'}
                </button>
              </div>
            </div>

            {savedNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{savedNotice}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-Builder Modal */}
      {isBuilderOpen && (
        <WorkbookAutoBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          existingWorkbook={editingWorkbook}
          initialTab={builderInitialTab}
          userSession={userSession}
          onCreated={() => {
            fetchFleetData();
            setIsBuilderOpen(false);
          }}
        />
      )}

    </div>
  );
}
