import React from 'react';
import { Zap, Shield, Rocket, Target } from 'lucide-react';

export default function UniversalTierSelector({ activeTier, onSelectTier, activeExchange }) {
  const isUsMarket = activeExchange === 'NYSE' || activeExchange === 'NASDAQ';

  const TIERS = [
    {
      id: 'TIER_3',
      icon: Zap,
      badge: 'STEALTH ALPHA',
      title: isUsMarket ? 'Tier 3: US Coiled Microcaps' : 'Tier 3: Coiled Spring Microcaps',
      subtitle: isUsMarket ? 'Sub-$5 Penny Stocks & OTC compression' : 'Sub-10c ASX Microcaps & Coiled Springs',
      stats: '2% Chase Tolerance | OBV Accumulation | Kelly Sized',
      accentColor: 'text-amber-400',
      bgColor: 'border-amber-500/40 bg-amber-500/5'
    },
    {
      id: 'TIER_1',
      icon: Shield,
      badge: 'FOUNDATION',
      title: isUsMarket ? 'Tier 1: S&P 500 / Nasdaq Fortress' : 'Tier 1: ASX 100 Fortress',
      subtitle: isUsMarket ? 'Megacap Tech & Dividend Aristocrats' : 'Liquid Bluechips & C:10 Defensive Leaders',
      stats: 'Lowest Slippage | Zero Whipsaw | FCF Compounders',
      accentColor: 'text-emerald-400',
      bgColor: 'border-emerald-500/40 bg-emerald-500/5'
    },
    {
      id: 'TIER_2',
      icon: Rocket,
      badge: 'MOMENTUM',
      title: isUsMarket ? 'Tier 2: Russell 2000 Breakouts' : 'Tier 2: High-Beta Midcaps',
      subtitle: 'Surging Institutional Volume & Kinematic Hooks',
      stats: 'MACD Bullish Hooks | 20/50 EMA Wave | Quant C:7+',
      accentColor: 'text-cyan-400',
      bgColor: 'border-cyan-500/40 bg-cyan-500/5'
    },
    {
      id: 'POI_SNIPER',
      icon: Target,
      badge: 'INSTITUTIONAL',
      title: 'Special POI Sniper Watchlist',
      subtitle: 'Critical Minerals, Assay Drills & Sector Personas',
      stats: 'Geologist Assays | Biotech FDA | Defense Contracts',
      accentColor: 'text-purple-400',
      bgColor: 'border-purple-500/40 bg-purple-500/5'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isSelected = activeTier === tier.id;

          return (
            <button
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 relative overflow-hidden group ${
                isSelected
                  ? `${tier.bgColor} border-2 shadow-lg shadow-black/40`
                  : 'bg-[#111827]/70 border-slate-800 hover:border-slate-700 hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-black/50 text-slate-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tier.badge}
                </span>
                <Icon className={`w-4 h-4 ${tier.accentColor}`} />
              </div>

              <h3 className="font-semibold text-slate-100 text-sm leading-tight mb-1">
                {tier.title}
              </h3>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                {tier.subtitle}
              </p>
              <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800/80 pt-1.5 truncate">
                {tier.stats}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
