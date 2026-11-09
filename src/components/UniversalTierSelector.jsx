import React from 'react';
import { Zap, Shield, Rocket, Target } from 'lucide-react';

export default function UniversalTierSelector({ activeTier, onSelectTier, activeExchange, theme = 'dark' }) {
  const isUsMarket = activeExchange === 'NYSE' || activeExchange === 'NASDAQ';
  const isLight = theme === 'light';

  const TIERS = [
    {
      id: 'TIER_3',
      icon: Zap,
      badge: 'STEALTH ALPHA',
      title: isUsMarket ? 'Tier 3: US Coiled Microcaps' : 'Tier 3: Coiled Spring Microcaps',
      subtitle: isUsMarket ? 'Sub-$5 Penny Stocks & OTC compression' : 'Sub-10c ASX Microcaps & Coiled Springs',
      stats: '2% Chase Tolerance | OBV Accumulation | Kelly Sized',
      accentColor: 'text-amber-500',
      bgColorSelected: isLight ? 'bg-amber-50 border-amber-500 shadow-md shadow-amber-500/10' : 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-black/40',
      badgeClass: isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'TIER_1',
      icon: Shield,
      badge: 'FOUNDATION',
      title: isUsMarket ? 'Tier 1: S&P 500 / Nasdaq Fortress' : 'Tier 1: ASX 100 Fortress',
      subtitle: isUsMarket ? 'Megacap Tech & Dividend Aristocrats' : 'Liquid Bluechips & C:10 Defensive Leaders',
      stats: 'Lowest Slippage | Zero Whipsaw | FCF Compounders',
      accentColor: 'text-emerald-500',
      bgColorSelected: isLight ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-black/40',
      badgeClass: isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
    },
    {
      id: 'TIER_2',
      icon: Rocket,
      badge: 'MOMENTUM',
      title: isUsMarket ? 'Tier 2: Russell 2000 Breakouts' : 'Tier 2: High-Beta Midcaps',
      subtitle: 'Surging Institutional Volume & Kinematic Hooks',
      stats: 'MACD Bullish Hooks | 20/50 EMA Wave | Quant C:7+',
      accentColor: 'text-cyan-500',
      bgColorSelected: isLight ? 'bg-cyan-50 border-cyan-500 shadow-md shadow-cyan-500/10' : 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-black/40',
      badgeClass: isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
    },
    {
      id: 'POI_SNIPER',
      icon: Target,
      badge: 'INSTITUTIONAL',
      title: 'Special POI Sniper Watchlist',
      subtitle: 'Critical Minerals, Assay Drills & Sector Personas',
      stats: 'Geologist Assays | Biotech FDA | Defense Contracts',
      accentColor: 'text-purple-500',
      bgColorSelected: isLight ? 'bg-purple-50 border-purple-500 shadow-md shadow-purple-500/10' : 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-black/40',
      badgeClass: isLight ? 'bg-purple-100 text-purple-800' : 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isSelected = activeTier === tier.id;

          return (
            <button
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group shadow-sm hover:shadow-md ${
                isSelected
                  ? `${tier.bgColorSelected} border-2`
                  : isLight
                    ? 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                    : 'bg-[#111827]/80 border-slate-800 hover:border-slate-700 hover:bg-[#111827] text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full font-mono ${
                  isSelected ? tier.badgeClass : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400')
                }`}>
                  {tier.badge}
                </span>
                <Icon className={`w-4 h-4 ${tier.accentColor}`} />
              </div>

              <h3 className={`font-bold text-sm leading-tight mb-1 ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}>
                {tier.title}
              </h3>
              <p className={`text-xs mb-2.5 leading-relaxed line-clamp-2 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {tier.subtitle}
              </p>
              <div className={`text-[10px] font-mono border-t pt-2 truncate ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-500'
              }`}>
                {tier.stats}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
