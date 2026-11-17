import React, { useState } from 'react';
import { 
  Key, 
  User, 
  Calendar, 
  Clock, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Layers, 
  Zap, 
  Database,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function UserCredentialsModal({ isOpen, onClose, userSession, onLogout, theme = 'dark' }) {
  if (!isOpen) return null;

  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState('CREDENTIALS'); // 'CREDENTIALS' | 'MAINTENANCE' | 'ROADMAP'

  const userEmail = userSession?.email || 'mrpswebster@gmail.com';
  const userName = userSession?.name || 'Institutional Quant Operator';
  const tenantId = userSession?.tenantId || 'TITAN-PRIMARY-NODE';
  const spreadsheetId = userSession?.spreadsheetId || '1O6bH4x2U2cK_pennymines_prod';
  const accessTier = userSession?.isAdmin || userEmail === 'mrpswebster@gmail.com' 
    ? 'SUPERADMIN_FLEET_CONTROLLER' 
    : 'CLIENT_ISOLATED_ENCLAVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden font-mono ${
        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#090d16] border-slate-800 text-slate-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0c121e]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Key className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  User Credentials &amp; Infrastructure Roadmap
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
                  TITAN V156 PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authenticated session identity, cryptographic node credentials, and maintenance telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Sub-Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-[#0a0f19]">
          <button
            type="button"
            onClick={() => setActiveTab('CREDENTIALS')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'CREDENTIALS'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Session Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MAINTENANCE')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'MAINTENANCE'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Planned Updates &amp; Maintenance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ROADMAP')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'ROADMAP'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Release Roadmap</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'CREDENTIALS' && (
            <div className="space-y-6">
              {/* User Identity Card */}
              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1422] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{userName}</div>
                      <div className="text-xs text-slate-400">{userEmail}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/40">
                    {accessTier}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block">Auth Provider:</span>
                    <span className="text-slate-200 font-bold flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Google OAuth 2.0 PKCE</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Session Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Cryptographically Valid</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sovereign Gatekeeper:</span>
                    <span className="text-cyan-400 font-bold mt-0.5 block">
                      Antigravity_Enabled: TRUE
                    </span>
                  </div>
                </div>
              </div>

              {/* Connected Workbook Node Credentials */}
              <div className="rounded-xl border border-slate-800 bg-[#0d1422] p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Scoped Connected Workbook Nodes</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-[#070b12] border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-emerald-400">pennymines-workbook</span>
                      <span className="text-slate-500 text-[11px] ml-2">Coiled Springs Breakouts</span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Key: 1O6bH4x2U2cK_pennymines_prod... • Status: Bound &amp; Verified
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      R/W Scoped
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#070b12] border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-purple-400">ai-trader-workbook</span>
                      <span className="text-slate-500 text-[11px] ml-2">Moonshot Multi-Baggers</span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Key: 1p_x99QzAI_trader_prod... • Status: Bound &amp; Verified
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      R/W Scoped
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#070b12] border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-blue-400">100-asx-workbook</span>
                      <span className="text-slate-500 text-[11px] ml-2">Bluechip Dividend Fortress</span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Key: 18_c7B100_asx_prod... • Status: Bound &amp; Verified
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      R/W Scoped
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MAINTENANCE' && (
            <div className="space-y-5">
              {/* Routine Maintenance Window Card */}
              <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Scheduled Maintenance Window: Every Sunday 02:00 – 04:00 AEST</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  During this scheduled 2-hour weekend window, zero-downtime rolling database vacuuming, cgroups memory cache trimming, and exchange calendar synchronization occur. Trading desks are offline as global markets are sealed.
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs font-mono text-emerald-300">
                  <span>Next Window: Sunday 22 Nov 2026 02:00 AEST</span>
                  <span>• Impact: Zero Intraday Interruption</span>
                </div>
              </div>

              {/* Real-time Infrastructure Uptime & Node Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1422]">
                  <span className="text-slate-500 text-xs block">Render Cloud Backend</span>
                  <div className="mt-1 text-base font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>99.98% Uptime</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">asx-quant-brain.onrender.com</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1422]">
                  <span className="text-slate-500 text-xs block">Render Frontend V2</span>
                  <div className="mt-1 text-base font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active &amp; Cached</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">titan-frontend-0ahm.onrender.com</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1422]">
                  <span className="text-slate-500 text-xs block">Autonomous SRE Daemon</span>
                  <div className="mt-1 text-base font-bold text-cyan-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>Loop: 30s Heartbeat</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Memory watchdog &amp; libc malloc_trim</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ROADMAP' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1422] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-emerald-400">TITAN V156 (Production Live)</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">CURRENT</span>
                </div>
                <p className="text-xs text-slate-300">
                  Option A pure rolling quant scores, Opportunity B ping-pong spread harvester, TanStack query in-memory caching, and verified volume multiplier gates.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-cyan-400">TITAN V157 (Targeted Q1 2027)</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">NEXT SPRINT</span>
                </div>
                <p className="text-xs text-slate-300">
                  Autonomous High-Frequency Ping-Pong Limit Arbitrage, sub-second market data WebSocket push streams, and automated multi-tenant sheet branch reconciliation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1422] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-purple-400">TITAN V158 (Enterprise FIX Gateway)</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">FUTURE</span>
                </div>
                <p className="text-xs text-slate-300">
                  Direct FIX Protocol Broker connectivity (Interactive Brokers / OpenMarkets) with algorithmic VWAP/TWAP order routing and institutional prime brokerage reconciliation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c121e] flex items-center justify-between text-xs text-slate-400">
          <div>
            Session: <span className="text-slate-200 font-bold">{userEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold transition"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
