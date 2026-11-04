import React, { useState } from 'react';
import { X, Smartphone, Mic, FileText, Headphones, ToggleLeft, ToggleRight, Trophy, Sparkles } from 'lucide-react';

export default function FinTechProSuiteModal({ isOpen, onClose }) {
  const [addons, setAddons] = useState({
    pwa: true,
    voice: false,
    taxPack: true,
    audioBrief: true,
    sandbox: false,
    leaderboard: true
  });

  if (!isOpen) return null;

  const toggleAddon = (key) => {
    setAddons((prev) => ({ ...prev, [key]: !prev [key] }));
  };

  const ITEMS = [
    {
      key: 'pwa',
      icon: Smartphone,
      title: 'PWA Mobile App (One-Click Install)',
      desc: 'Install TITAN as an offline-first iOS/Android progressive web app with biometric login.'
    },
    {
      key: 'voice',
      icon: Mic,
      title: 'Voice-to-Trade Mic Terminal',
      desc: 'Speak orders naturally: "Buy 10,000 units of WA1 at 14.50 limit with trailing stop".'
    },
    {
      key: 'taxPack',
      icon: FileText,
      title: 'EOFY Multi-Currency Tax Pack',
      desc: 'Automated ATO (AU) and IRS (US) FIFO capital gains tax export with live exchange rate baselines.'
    },
    {
      key: 'audioBrief',
      icon: Headphones,
      title: '9:55 AM Local Market Open Audio Brief',
      desc: 'AI synthesized 60-second audio morning brief delivered 5 minutes before the opening bell.'
    },
    {
      key: 'sandbox',
      icon: ToggleLeft,
      title: 'Strict Paper Sandbox Mode',
      desc: 'Simulate millisecond live order fills without deploying genuine brokerage fiat capital.'
    },
    {
      key: 'leaderboard',
      icon: Trophy,
      title: 'Verified Global Quant Leaderboard',
      desc: 'Share verified Sharpe ratios and alpha returns anonymously with the Titan quant community.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#151d30]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">FinTech Pro Modular Add-On Suite</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const enabled = addons[item.key];

            return (
              <div
                key={item.key}
                onClick={() => toggleAddon(item.key)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  enabled
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="pl-3">
                  {enabled ? (
                    <span className="text-emerald-400 font-mono text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                      ON
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">
                      OFF
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#151d30] flex items-center justify-between">
          <span className="text-xs text-slate-400">Settings saved automatically to tenant profile</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
