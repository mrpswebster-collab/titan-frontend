import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Shield, ArrowRight } from 'lucide-react';

export default function KellySizingCalculator({ ticker, price, currency, onApplyUnits }) {
  const [equity, setEquity] = useState(currency === 'USD' ? 65000 : 100000);
  const [winRate, setWinRate] = useState(55); // 55%
  const [rewardRatio, setRewardRatio] = useState(2.5); // 2.5:1
  const [fractionMode, setFractionMode] = useState('HALF'); // HALF Kelly or FULL Kelly

  // Kelly Formula: K% = W - (1 - W) / R
  const w = winRate / 100;
  const r = rewardRatio;
  const fullKelly = w - (1 - w) / r;
  const rawFraction = Math.max(0, fullKelly);
  const fractionMultiplier = fractionMode === 'HALF' ? 0.5 : fractionMode === 'QUARTER' ? 0.25 : 1.0;
  const effectiveFraction = rawFraction * fractionMultiplier;
  
  // Cap at 15% maximum risk allocation per trade for institutional safety
  const finalAllocationPct = Math.min(effectiveFraction, 0.15);
  const allocationAmount = Math.round(equity * finalAllocationPct);
  const currentPrice = price || 1.0;
  const recommendedUnits = currentPrice > 0 ? Math.floor(allocationAmount / currentPrice) : 0;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 text-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Kelly Criterion & Risk Sizing Calculator</span>
        </div>
        <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
          {fractionMode} KELLY (RULE 37)
        </span>
      </div>

      <div className="space-y-3 font-mono">
        {/* Win Rate Slider */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
            <span>Estimated Win Rate</span>
            <span className="text-emerald-400 font-bold">{winRate}%</span>
          </div>
          <input
            type="range"
            min="35"
            max="80"
            value={winRate}
            onChange={(e) => setWinRate(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Reward to Risk Ratio Slider */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
            <span>Reward-to-Risk Ratio</span>
            <span className="text-cyan-400 font-bold">{rewardRatio.toFixed(1)} : 1</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={rewardRatio}
            onChange={(e) => setRewardRatio(Number(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Fractional Safety Mode */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400 text-[11px]">Risk Dampener:</span>
          <div className="flex gap-1">
            {['QUARTER', 'HALF', 'FULL'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFractionMode(mode)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  fractionMode === mode
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Output Card */}
        <div className="bg-[#0a0e17] border border-slate-800 rounded-lg p-3 mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px]">OPTIMAL RISK ALLOC</span>
            <span className="text-emerald-400 font-bold text-sm">
              {(finalAllocationPct * 100).toFixed(1)}%
            </span>
            <span className="text-slate-500 block text-[9px]">
              {currency === 'USD' ? '$' : 'A$'}{allocationAmount.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">RECOMMENDED POSITION</span>
            <span className="text-cyan-300 font-bold text-sm">
              {recommendedUnits.toLocaleString()} units
            </span>
            <span className="text-slate-500 block text-[9px]">
              @ {currency === 'USD' ? '$' : 'A$'}{currentPrice.toFixed(3)}
            </span>
          </div>
        </div>

        {onApplyUnits && recommendedUnits > 0 && (
          <button
            onClick={() => onApplyUnits(recommendedUnits)}
            className="w-full py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Apply {recommendedUnits.toLocaleString()} Units to Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
