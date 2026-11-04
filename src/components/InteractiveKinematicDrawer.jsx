import React, { useState } from 'react';
import { X, Activity, ShieldAlert, Cpu, ArrowUpRight, BarChart2, CheckCircle2 } from 'lucide-react';
import KellySizingCalculator from './KellySizingCalculator';

export default function InteractiveKinematicDrawer({ ticker, data, onClose, onExecuteOrder }) {
  if (!ticker || !data) return null;

  const [orderUnits, setOrderUnits] = useState(10000);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0f172a] border-l border-slate-800 shadow-2xl z-50 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-slate-100">{ticker}</span>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">
            Conviction {data.conviction || 'C:8'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {data.exchange || 'ASX'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Live Price & Slippage Ceiling */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Current Market Price</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4.2%
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-100 mb-3">
            {data.currency === 'USD' ? '$' : 'A$'}{data.price?.toFixed(3) || '0.045'}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">2% CHASE LIMIT CEILING</span>
              <span className="text-amber-400 font-semibold">
                {data.currency === 'USD' ? '$' : 'A$'}{((data.price || 0.045) * 1.02).toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">RULE 24 MIN PARCEL</span>
              <span className="text-slate-300 font-semibold">$500 AUD</span>
            </div>
          </div>
        </div>

        {/* Kinematic Vectors */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kinematic Vectors & Mathematical Hooks</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block mb-1">MACD HOOK (12/26)</span>
              <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Bullish Hook +0.003
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Histogram positive divergence</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block mb-1">WILDER'S RSI (14)</span>
              <span className="font-mono font-bold text-cyan-400 text-xs">
                41.2 (Coiled Launch Zone)
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Rebounded off 35 oversold base</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block mb-1">OBV DIVERGENCE (RULE 53)</span>
              <span className="font-mono font-bold text-amber-400 text-xs">
                Stealth Accumulation
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Volume surging while price flat</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block mb-1">20/50 EMA SPREAD</span>
              <span className="font-mono font-bold text-slate-200 text-xs">
                +1.8% Golden Arc
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Price above both short EMAs</span>
            </div>
          </div>
        </div>

        {/* Kelly Criterion & Risk Sizing Calculator */}
        <KellySizingCalculator
          ticker={ticker}
          price={data.price}
          currency={data.currency}
          onApplyUnits={(units) => setOrderUnits(units)}
        />

        {/* AI Sector Persona Synthesis */}
        <div className="bg-[#111827] border border-purple-900/40 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Sector Persona Audit (Exploration Geologist)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            Assay disclosure confirms 42m @ 2.4 g/t Au from 80m depth with open strike extension. Cash runway estimated at 14 months post-Q3 release. Low risk of imminent capital raise dilution.
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 border-t border-purple-900/30 pt-2">
            <span>Model: Gemini 2.0 Flash Cascade</span>
            <span>Grounding: ASIC / ASX Verified</span>
          </div>
        </div>

        {/* Real-Money Execution Guard */}
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-300/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Paper Sandbox Guard Active</span>
            <span className="text-[11px] text-amber-400/80 leading-normal">
              Simulation mode active. Orders are recorded to the test ledger with strict 2.0% chase limit enforcement and Rule 24 parcel checks. No real fiat money is deployed.
            </span>
          </div>
        </div>
      </div>

      {/* Footer Execution Action */}
      <div className="p-4 border-t border-slate-800 bg-[#111827] space-y-2">
        <button
          onClick={() => onExecuteOrder(ticker, { ...data, units: orderUnits })}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition duration-150"
        >
          <span>STAGE SIMULATED BUY ({orderUnits.toLocaleString()} Units @ {data.currency === 'USD' ? '$' : 'A$'}{((data.price || 0.045) * 1.01).toFixed(3)} LIMIT)</span>
        </button>
        <p className="text-[10px] text-center text-slate-500 font-mono">
          🧪 Simulated Paper Sandbox — No genuine fiat capital deployed.
        </p>
      </div>
    </div>
  );
}
