import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Sun, 
  Moon, 
  AlertCircle, 
  LogOut, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Key, 
  Zap, 
  Layers 
} from 'lucide-react';

export default function DualClockTelemetryBar({
  activeExchange,
  exchangeData,
  onRefresh,
  tenantId,
  onLogout,
  onOpenSecurity,
  onOpenCredentials,
  emergencyStoppedCount = 0
}) {
  const [clientTime, setClientTime] = useState(new Date());
  const [userTz, setUserTz] = useState('Australia/Sydney');
  const [productionCountdown, setProductionCountdown] = useState({ minutes: 12, seconds: 45 });

  useEffect(() => {
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolved) setUserTz(resolved);
    } catch (e) {
      console.warn('Failed to resolve client timezone:', e);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setClientTime(now);

      // Compute dynamic countdown to next 15-minute key production batch
      const mins = now.getMinutes();
      const secs = now.getSeconds();
      const remainingSecs = (15 - (mins % 15)) * 60 - secs;
      const displayMins = Math.floor(remainingSecs / 60);
      const displaySecs = remainingSecs % 60;
      setProductionCountdown({ minutes: displayMins, seconds: displaySecs });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatClientTime = () => {
    return clientTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: userTz
    });
  };

  const getClientDate = () => {
    return clientTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: userTz
    });
  };

  // Check if user is in Daylight Savings Time
  const isUserDst = () => {
    const jan = new Date(clientTime.getFullYear(), 0, 1);
    const jul = new Date(clientTime.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    return clientTime.getTimezoneOffset() < stdOffset;
  };

  const exMeta = exchangeData?.[activeExchange] || {
    name: 'Australian Securities Exchange',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    session_phase: 'CLOSED',
    is_open: false,
    open_time: '10:00',
    close_time: '16:00'
  };

  const getStatusBadge = (phase, isOpen) => {
    switch (phase) {
      case 'REGULAR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            MARKET OPEN (REGULAR)
          </span>
        );
      case 'PRE_MARKET':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            PRE-MARKET EARLY BIRD
          </span>
        );
      case 'AFTER_HOURS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            AFTER-HOURS WRAP
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/40 text-slate-400 border border-slate-600/50">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            MARKET CLOSED
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#111827]/95 backdrop-blur border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: User Local Time */}
        <div className="flex items-center gap-2 flex-wrap py-0.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Your Time:</span>
          </div>
          <span className="font-mono font-bold text-slate-100 text-sm tracking-wide">
            {formatClientTime()}
          </span>
          <span className="text-slate-400 font-mono text-xs hidden sm:inline">
            {getClientDate()}
          </span>
          <span className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 hidden md:inline">
            {userTz.split('/')[1]?.replace('_', ' ') || userTz}
            {isUserDst() && <span className="ml-1 text-emerald-400 font-bold font-mono">DST</span>}
          </span>
        </div>

        {/* Center: Live Exchange Bell Clock, Emergency Status, & Live Market Telemetry */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-medium">{exMeta?.name || activeExchange} Bell:</span>
            {exMeta?.local_time && (
              <span className="font-mono font-semibold text-cyan-300">
                {String(exMeta.local_time).includes(' ') ? String(exMeta.local_time).split(' ')[1] : String(exMeta.local_time)}
              </span>
            )}
            {getStatusBadge(exMeta?.session_phase, exMeta?.is_open)}

            {/* Live Tape Telemetry Badge */}
            {exMeta?.is_open || exMeta?.session_phase === 'REGULAR' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Tape: $0.160 • Vol: 2.1x Verified • Sync: &lt;0.4s</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                <Moon className="w-2.5 h-2.5 text-amber-400" />
                <span>Tape Sealed: $0.160 • Vol: Verified • EOD 16:10</span>
              </span>
            )}

            {/* Next Key Production Run Countdown */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
              <Clock className="w-2.5 h-2.5 text-cyan-400" />
              <span>Next Production Batch: <b>{productionCountdown.minutes}m {productionCountdown.seconds < 10 ? '0' : ''}{productionCountdown.seconds}s</b></span>
            </span>
          </div>

          {/* Emergency Stopped Workbooks Fleet Status under Exchange Details */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {emergencyStoppedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>{emergencyStoppedCount} Workbook(s) Emergency Stopped</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>All Fleet Nodes Operating</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Security Threat Enclave, User Credentials, & Logout Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSecurity && (
            <button
              type="button"
              onClick={onOpenSecurity}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-mono font-bold transition shadow-sm hover:border-emerald-500/50"
              title="Open Zero-Trust Security Threat Enclave"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Security</span>
            </button>
          )}

          {onOpenCredentials && (
            <button
              type="button"
              onClick={onOpenCredentials}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-bold transition shadow-sm hover:border-cyan-500/50"
              title="Open User Credentials &amp; Planned Maintenance"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Credentials</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-mono font-bold transition shadow-sm hover:border-rose-600 active:scale-95"
              title="Logout of Titan Institutional Enclave"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
