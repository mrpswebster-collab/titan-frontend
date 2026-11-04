import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';

const PRESET_CAPS = [5000, 10000, 25000, 50000, 100000, 250000];

export default function KellySizingCalculator({ ticker, price, currency = 'AUD', initialEquity = 25000, onApplyUnits }) {
  const [equity, setEquity] = useState(Number(initialEquity) || 25000);
  const [equityInput, setEquityInput] = useState(String(initialEquity || 25000));
  const [winRate, setWinRate] = useState(55);
  const [rewardRatio, setRewardRatio] = useState(2.5);
  const [fractionMode, setFractionMode] = useState('HALF');

  useEffect(() => {
    if (initialEquity && Number(initialEquity) > 0) {
      setEquity(Number(initialEquity));
      setEquityInput(String(initialEquity));
    }
  }, [initialEquity]);

  const handleCustomEquityChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setEquityInput(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      setEquity(num);
    }
  };

  const handleSelectPreset = (amt) => {
    setEquity(amt);
    setEquityInput(String(amt));
  };

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
        {/* Editable Capital Pool Input + Presets */}
        <div className="bg-[#0a0e17] border border-slate-800 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              Account Capital ({currency}):
            </span>
            <div className="relative">
              <span className="absolute left-2 top-1 text-[11px] text-slate-400">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={equityInput}
                onChange={handleCustomEquityChange}
                placeholder="Type capital"
                className="w-28 bg-[#111827] border border-emerald-500/40 focus:border-emerald-400 rounded px-2 pl-5 py-0.5 text-right text-xs font-bold text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {PRESET_CAPS.map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => handleSelectPreset(amt)}
                className={`py-1 rounded text-[10px] font-bold border transition ${
                  Number(equity) === amt
                    ? 'bg-emerald-500 text-black border-emerald-400'
                    : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                ${amt / 1000}k
              </button>
            ))}
          </div>
        </div>

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
                type="button"
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
            <span className="text-slate-400 block text-[10px]">
              {currency} ${allocationAmount.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">RECOMMENDED PARCEL</span>
            <span className="text-slate-100 font-bold text-sm">
              {recommendedUnits.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">units</span>
            </span>
            <button
              type="button"
              onClick={() => onApplyUnits && onApplyUnits(recommendedUnits)}
              className="mt-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline"
            >
              Apply to Order Ticket &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
