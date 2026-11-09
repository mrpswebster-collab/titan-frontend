import React from 'react';
import { X, ShieldCheck, Zap, SlidersHorizontal, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

export default function GuidedTourModal({ isOpen, onClose, theme = 'dark' }) {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const sections = [
    {
      icon: Zap,
      title: '1. Coiled Spring Radar & C-Scores',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'The scanner detects institutional accumulation before public breakouts. C-Scores (C:7 to C:10) evaluate Volatility Compression (NR7 squeeze), Chaikin Money Flow (CMF > 0.05), and positive MACD histogram slope.'
    },
    {
      icon: ShieldCheck,
      title: '2. Rule 24: 2% Slippage Cap',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Market orders are strictly banned. All orders execute via Marketable Limit Orders capped at Signal Price + 2%. You never chase overextended spikes.'
    },
    {
      icon: Sparkles,
      title: '3. Rule 42: Two-Stage Free Ride',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      description: 'When an investment reaches +100% gain, 50% is harvested immediately back to cash to return 100% of your starting capital. The remaining 50% runs on house money targeting 2,000%+ returns.'
    },
    {
      icon: SlidersHorizontal,
      title: '4. Autonomous vs. 1-Tap Confirmed',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      description: 'You have full sovereignty. Set your workbook to AUTONOMOUS for automated execution, or HUMAN_CONFIRMED to receive 1-tap confirmation alerts with countdown timers.'
    },
    {
      icon: FileSpreadsheet,
      title: '5. Google Sheet & FastMCP Sync',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Your private Google Sheet connects natively. Every trade appends to your Trade_Log in real time with an immutable tamper-proof audit trail.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`max-w-2xl w-full rounded-2xl p-6 shadow-2xl transition-all border max-h-[90vh] overflow-y-auto ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'
            : 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-black/80'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950 font-bold text-slate-950 text-lg">
              📘
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Institutional Terminal Guide</h2>
              <p className="text-xs text-slate-400 font-mono">Titan Trading Desk • Sovereign Financial Standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Core Feature Cards */}
        <div className="space-y-3.5">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition flex items-start gap-3.5 ${
                  isLight
                    ? 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
                    : 'bg-[#111827] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg border flex-shrink-0 ${sec.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold mb-1 flex items-center gap-2">
                    <span>{sec.title}</span>
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {sec.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready for Market Sessions</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            Got It, Let's Trade
          </button>
        </div>
      </div>
    </div>
  );
}
