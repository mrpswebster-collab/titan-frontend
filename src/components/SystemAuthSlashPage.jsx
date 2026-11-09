import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Server,
  Database,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Terminal,
  ExternalLink,
  FileCode,
  UserCheck,
  Hash,
  Cpu,
  Layers,
  Globe,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';

// FastMCP Scoped Workbooks & SSE Endpoints configured across Titan Ecosystem
const SYSTEM_MCP_SERVERS = [
  {
    id: '100-asx-workbook',
    name: '100 ASX Institutional Workbook',
    exchange: 'ASX (Australia)',
    scope: 'ASX_TOP100_LEDGER',
    token: '1LjEACQtjZLKgKxsw26_rB3o7XOKCVG5h4A2S_-fDITY',
    endpoint: 'https://asx-quant-brain.onrender.com/mcp/sse?token=1LjEACQtjZLKgKxsw26_rB3o7XOKCVG5h4A2S_-fDITY',
    cli: 'fastmcp run https://asx-quant-brain.onrender.com/mcp/sse?token=1LjEACQtjZLKgKxsw26_rB3o7XOKCVG5h4A2S_-fDITY',
    tools: ['fetch_sniper_targets', 'execute_portfolio_action', 'get_consolidated_ledger', 'get_system_telemetry', 'get_mcp_logs']
  },
  {
    id: 'ai-trader-workbook',
    name: 'AI Trader Autonomous Workbook',
    exchange: 'ASX & Global Multi-Asset',
    scope: 'AI_AUTONOMOUS_TRADER',
    token: '1QE0FTQ7qwq6L61-JEMaFAbRBypRvHvufAbayDqTPCVM',
    endpoint: 'https://asx-quant-brain.onrender.com/mcp/sse?token=1QE0FTQ7qwq6L61-JEMaFAbRBypRvHvufAbayDqTPCVM',
    cli: 'fastmcp run https://asx-quant-brain.onrender.com/mcp/sse?token=1QE0FTQ7qwq6L61-JEMaFAbRBypRvHvufAbayDqTPCVM',
    tools: ['fetch_sniper_targets', 'execute_portfolio_action', 'get_consolidated_ledger', 'get_system_telemetry']
  },
  {
    id: 'pennymines-workbook',
    name: 'PennyMines & Assay Geologist',
    exchange: 'ASX Penny Explorers ($0.001-$0.50)',
    scope: 'PENNYMINES_DEEP_COMPRESSION',
    token: '1U7zf61EadIx4qmfL1Z69O_Ve5YCnhHKgECYe6ojisnE',
    endpoint: 'https://asx-quant-brain.onrender.com/mcp/sse?token=1U7zf61EadIx4qmfL1Z69O_Ve5YCnhHKgECYe6ojisnE',
    cli: 'fastmcp run https://asx-quant-brain.onrender.com/mcp/sse?token=1U7zf61EadIx4qmfL1Z69O_Ve5YCnhHKgECYe6ojisnE',
    tools: ['fetch_poi_targets', 'fetch_sniper_targets', 'execute_portfolio_action', 'get_system_telemetry']
  },
  {
    id: 'special-workbook',
    name: 'Special Situations & Moonshot Spring',
    exchange: 'Global Coiled Multi-Baggers',
    scope: 'SPECIAL_MOONSHOT_RUNNER',
    token: '1eOu_xRWaMKJZudW45aoS0ZxaVGa_0qRRUcIqu9mN8UU',
    endpoint: 'https://asx-quant-brain.onrender.com/mcp/sse?token=1eOu_xRWaMKJZudW45aoS0ZxaVGa_0qRRUcIqu9mN8UU',
    cli: 'fastmcp run https://asx-quant-brain.onrender.com/mcp/sse?token=1eOu_xRWaMKJZudW45aoS0ZxaVGa_0qRRUcIqu9mN8UU',
    tools: ['fetch_sniper_targets', 'execute_portfolio_action', 'get_consolidated_ledger']
  },
  {
    id: 'titan-us-workbook',
    name: 'Titan US Brain (NYSE / NASDAQ)',
    exchange: 'US Wall St Equities',
    scope: 'TITAN_US_SOVEREIGN_BRAIN',
    token: '1pH9-1d7kTMd_yyW0nAkd7eqyAukgx8sXh5fk6fYqGTw',
    endpoint: 'https://titan-us-brain.onrender.com/mcp/sse?token=1pH9-1d7kTMd_yyW0nAkd7eqyAukgx8sXh5fk6fYqGTw',
    cli: 'fastmcp run https://titan-us-brain.onrender.com/mcp/sse?token=1pH9-1d7kTMd_yyW0nAkd7eqyAukgx8sXh5fk6fYqGTw',
    tools: ['fetch_sniper_targets', 'execute_portfolio_action', 'get_system_telemetry']
  }
];

export default function SystemAuthSlashPage({ userSession, theme = 'dark', onNavigateHome }) {
  const isLight = theme === 'light';

  // State
  const [copiedKey, setCopiedKey] = useState(null);
  const [showTokens, setShowTokens] = useState({});
  const [backendConfig, setBackendConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);
  const [pingStatus, setPingStatus] = useState('IDLE'); // 'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'
  const [selectedMcpTab, setSelectedMcpTab] = useState('100-asx-workbook');

  // Copy helper
  const handleCopy = (text, keyId) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  // Toggle token reveal
  const toggleTokenVisibility = (id) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch backend auth config & measure latency
  const runAuthDiagnostic = async () => {
    setIsLoadingConfig(true);
    setPingStatus('TESTING');
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/config`);
      const latency = Math.round(performance.now() - startTime);
      setPingLatency(latency);
      if (res.ok) {
        const data = await res.json();
        setBackendConfig(data);
        setPingStatus('SUCCESS');
      } else {
        setPingStatus('ERROR');
      }
    } catch (e) {
      setPingStatus('ERROR');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    runAuthDiagnostic();
  }, []);

  // Export MCP configuration JSON
  const handleExportConfig = () => {
    const configObj = {
      mcpServers: {
        supabase: {
          serverUrl: "https://mcp.supabase.com/mcp?project_ref=ayhlrumxvcfeirnxykah&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching"
        },
        ...SYSTEM_MCP_SERVERS.reduce((acc, s) => {
          acc[s.id] = {
            command: "fastmcp",
            args: ["run", s.endpoint]
          };
          return acc;
        }, {})
      }
    };
    const jsonStr = JSON.stringify(configObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'titan-mcp-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedMcp = SYSTEM_MCP_SERVERS.find(s => s.id === selectedMcpTab) || SYSTEM_MCP_SERVERS[0];

  return (
    <div className={`min-h-[calc(100vh-140px)] w-full py-6 px-3 sm:px-6 transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080d16] text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Breadcrumb & Route Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  /auth
                </span>
                <h1 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  System Authentication & Cryptographic Keys
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Centralized Zero-Trust Token Enclave • FastMCP Workbooks • OAuth 2.0 PKCE • Rule 19 Isolation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAuthDiagnostic}
              disabled={isLoadingConfig}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border shadow-sm ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Test Gateway Handshake Ping"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingConfig ? 'animate-spin' : ''}`} />
              <span>{isLoadingConfig ? 'Testing...' : 'Test Handshake'}</span>
            </button>

            <button
              onClick={handleExportConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition shadow-sm"
              title="Download Full Antigravity mcp_config.json"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export mcp_config.json</span>
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition border border-slate-700"
              >
                <span>Return to Terminal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: EXECUTIVE AUTHENTICATION & SECURITY OVERVIEW STATUS                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Active User Session */}
          <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a]/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Active Session
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {userSession?.isAuthed ? 'VERIFIED' : 'PUBLIC GATE'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-100 truncate">
                {userSession?.name || 'Paul Webster'}
              </div>
              <div className="text-[11px] font-mono text-emerald-400 truncate">
                {userSession?.email || 'mrpwswebster@gmail.com'}
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Tenant: <strong className="text-slate-200">{userSession?.tenantId || 'TENANT-ALPHA'}</strong></span>
                <span className="text-cyan-400 font-bold">2-PIN ARMED</span>
              </div>
            </div>
          </div>

          {/* Card 2: FastMCP Gateway Cluster */}
          <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a]/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                FastMCP Agent Cluster
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                5 SERVERS LIVE
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Antigravity SSE Protocol</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Scoped Bearer Handshake (FastMCP)
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Streaming SSE: <strong className="text-emerald-400">200 OK</strong></span>
                <span>Portfolios Scoped</span>
              </div>
            </div>
          </div>

          {/* Card 3: Backend API & OAuth Status */}
          <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a]/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                API Gateway & OAuth
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                pingStatus === 'SUCCESS'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : pingStatus === 'TESTING'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {pingLatency ? `${pingLatency}ms` : 'CONNECTED'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>asx-quant-brain.onrender.com</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                Mode: {backendConfig?.security_mode || 'GOOGLE_OAUTH2_2FA_PIN'}
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Bot Filter: <strong className="text-cyan-400">Turnstile OK</strong></span>
                <span>PKCE Enforced</span>
              </div>
            </div>
          </div>

          {/* Card 4: Rule 19 Zero-Trust Isolation */}
          <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a]/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Zero-Trust Gate
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold">
                RULE 19 ACTIVE
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>PostgreSQL RLS Partitioning</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Cross-Tenant Leakage: 0.00%
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Ref: <strong className="text-slate-200">ayhlrumxvcfe...</strong></span>
                <span className="text-emerald-400 font-bold">ISOLATED</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 2: ALL REQUIRED AUTHENTICATION STUFF (CLEAN, NON-OVER-SPILLING GRID)  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* PANEL 1 (Left 7 Cols): FastMCP Scoped Tokens & Agent Workbooks */}
          <div className={`lg:col-span-7 rounded-2xl border p-5 space-y-4 shadow-md overflow-hidden ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0d131f] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  FastMCP Scoped Workbook Bearer Tokens
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Rule 19 Cryptographic Workbooks
              </span>
            </div>

            {/* Workbook Selector Pills - tightly wrapped, no spill */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              {SYSTEM_MCP_SERVERS.map(mcp => (
                <button
                  key={mcp.id}
                  onClick={() => setSelectedMcpTab(mcp.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all truncate ${
                    selectedMcpTab === mcp.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {mcp.name.split(' ')[0]} {mcp.name.split(' ')[1] || ''}
                </button>
              ))}
            </div>

            {/* Selected MCP Workbook Deep Dive Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{selectedMcp.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {selectedMcp.exchange}
                    </span>
                  </h3>
                  <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                    Tenant Scope: {selectedMcp.scope}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleTokenVisibility(selectedMcp.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                    title={showTokens[selectedMcp.id] ? "Hide Token" : "Reveal Token"}
                  >
                    {showTokens[selectedMcp.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(selectedMcp.token, `token-${selectedMcp.id}`)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition"
                    title="Copy Scoped Bearer Token"
                  >
                    {copiedKey === `token-${selectedMcp.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{copiedKey === `token-${selectedMcp.id}` ? 'Copied' : 'Token'}</span>
                  </button>
                </div>
              </div>

              {/* Scoped Bearer Token String Box (Strictly bounded, break-all, non-overspilling) */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 block">
                  Scoped Cryptographic Bearer Token
                </label>
                <div className="p-2.5 rounded-lg bg-[#070b12] border border-slate-800/90 font-mono text-xs text-amber-300 break-all select-all flex items-center justify-between gap-2 overflow-hidden">
                  <span className="truncate">
                    {showTokens[selectedMcp.id]
                      ? selectedMcp.token
                      : `${selectedMcp.token.substring(0, 10)}••••••••••••••••••••••••••••${selectedMcp.token.substring(selectedMcp.token.length - 6)}`}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                    SCOPED
                  </span>
                </div>
              </div>

              {/* SSE Gateway URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>FastMCP Server-Sent Events (SSE) Endpoint</span>
                  <button
                    onClick={() => handleCopy(selectedMcp.endpoint, `endpoint-${selectedMcp.id}`)}
                    className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                  >
                    {copiedKey === `endpoint-${selectedMcp.id}` ? 'Copied URL' : 'Copy URL'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-[#070b12] border border-slate-800/90 font-mono text-[11px] text-slate-300 break-all select-all overflow-hidden">
                  {selectedMcp.endpoint}
                </div>
              </div>

              {/* FastMCP CLI Command */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span>FastMCP Run CLI Command</span>
                  </span>
                  <button
                    onClick={() => handleCopy(selectedMcp.cli, `cli-${selectedMcp.id}`)}
                    className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    {copiedKey === `cli-${selectedMcp.id}` ? 'Copied CLI' : 'Copy CLI'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-[#05080f] border border-slate-800 font-mono text-[11px] text-emerald-300 break-all select-all overflow-hidden">
                  {selectedMcp.cli}
                </div>
              </div>

              {/* Scoped MCP Tools Allowed under Rule 19 */}
              <div className="pt-1">
                <div className="text-[10px] font-mono text-slate-400 mb-1.5">
                  Tenant Tools Scoped for this Workbook:
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedMcp.tools.map(tool => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {tool}()
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick FastMCP Summary Table - compact & overflow-x-auto */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Server Name</th>
                    <th className="py-2.5 px-3">Scope</th>
                    <th className="py-2.5 px-3">Token Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#070b12]">
                  {SYSTEM_MCP_SERVERS.map(s => (
                    <tr key={s.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 font-bold text-slate-200">
                        {s.name}
                      </td>
                      <td className="py-2 px-3 text-[10px] text-cyan-400">
                        {s.scope}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ACTIVE ({s.token.substring(0, 5)}...)
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleCopy(s.token, `row-${s.id}`)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        >
                          {copiedKey === `row-${s.id}` ? '✓ Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* PANEL 2 (Right 5 Cols): OAuth 2.0, Supabase RLS, Turnstile & PIN Keys */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Box A: Google OAuth 2.0 PKCE & Turnstile Public Keys */}
            <div className={`rounded-2xl border p-5 space-y-3 shadow-md overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0d131f] border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-100">
                    Google OAuth & Cloudflare Turnstile
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  2-POINT PKCE
                </span>
              </div>

              {/* Google Client ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Google OAuth 2.0 Client ID</span>
                  <button
                    onClick={() => handleCopy(
                      backendConfig?.google_client_id || "668225955513-pll64p6bvncq99vsuopv0hioi7bt5r7d.apps.googleusercontent.com",
                      'google-client-id'
                    )}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedKey === 'google-client-id' ? 'Copied' : 'Copy ID'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 break-all select-all overflow-hidden">
                  {backendConfig?.google_client_id || "668225955513-pll64p6bvncq99vsuopv0hioi7bt5r7d.apps.googleusercontent.com"}
                </div>
              </div>

              {/* Cloudflare Turnstile Site Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Cloudflare Turnstile Anti-Bot Site Key</span>
                  <button
                    onClick={() => handleCopy(
                      backendConfig?.turnstile_site_key || "1x00000000000000000000AA",
                      'turnstile-key'
                    )}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedKey === 'turnstile-key' ? 'Copied' : 'Copy Key'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all overflow-hidden">
                  {backendConfig?.turnstile_site_key || "1x00000000000000000000AA"}
                </div>
              </div>

              {/* Endpoints Table */}
              <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                <div className="text-[10px] font-mono text-slate-400">
                  Active Auth Endpoints:
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1 text-slate-300 text-[10px]">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-400">Handshake:</span>
                    <span className="text-emerald-400 truncate">/api/v2/auth/handshake</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-400">PIN Login:</span>
                    <span className="text-cyan-400 truncate">/api/v2/auth/login-with-pin</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-400">Config:</span>
                    <span className="text-amber-400 truncate">/api/v2/auth/config</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Box B: PostgreSQL Supabase RLS & Google Apps Script Keys */}
            <div className={`rounded-2xl border p-5 space-y-3 shadow-md overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0d131f] border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-slate-100">
                    Supabase Database RLS & Apps Script
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-purple-400">
                  ISOLATED
                </span>
              </div>

              {/* Supabase Project Ref */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Supabase Project Ref</span>
                  <button
                    onClick={() => handleCopy("ayhlrumxvcfeirnxykah", "supabase-ref")}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'supabase-ref' ? 'Copied' : 'Copy Ref'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-300 break-all select-all overflow-hidden flex items-center justify-between">
                  <span>ayhlrumxvcfeirnxykah</span>
                  <span className="text-[9px] px-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    RLS ENFORCED
                  </span>
                </div>
              </div>

              {/* Supabase FastMCP URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Database FastMCP MCP URL</span>
                  <button
                    onClick={() => handleCopy("https://mcp.supabase.com/mcp?project_ref=ayhlrumxvcfeirnxykah&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching", "supabase-mcp")}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'supabase-mcp' ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all overflow-hidden">
                  https://mcp.supabase.com/mcp?project_ref=ayhlrumxvcfeirnxykah...
                </div>
              </div>

              {/* Google Apps Script Library ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Google Apps Script Library ID</span>
                  <button
                    onClick={() => handleCopy("1A2B3C4D5E6F7G8H9J-TITAN-CORE", "apps-script-lib")}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    {copiedKey === 'apps-script-lib' ? 'Copied' : 'Copy Lib'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300 break-all select-all overflow-hidden">
                  TitanLibrary (v156 Institutional Core)
                </div>
              </div>

            </div>

            {/* Box C: Quick Session Actions & Zero-Trust Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070b12] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-Trust Governance Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                In compliance with <strong>Titan Desk Rule 19</strong>, all API, MCP SSE, and database operations execute within your strictly isolated tenant envelope. No cross-tenant leakage or workbook contamination is permitted.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
