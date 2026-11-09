import React from 'react';
import { TrendingUp } from 'lucide-react';

const EXCHANGES = [
  {
    code: 'ASX',
    flag: '🇦🇺',
    label: 'ASX',
    fullName: 'Australian Securities Exchange',
    currency: 'AUD',
    symbol: '$'
  },
  {
    code: 'NYSE',
    flag: '🇺🇸',
    label: 'NYSE / NASDAQ',
    fullName: 'Wall Street New York',
    currency: 'USD',
    symbol: '$'
  },
  {
    code: 'LSE',
    flag: '🇬🇧',
    label: 'LSE',
    fullName: 'London Stock Exchange',
    currency: 'GBP',
    symbol: '£'
  },
  {
    code: 'TSX',
    flag: '🇨🇦',
    label: 'TSX',
    fullName: 'Toronto Stock Exchange',
    currency: 'CAD',
    symbol: 'C$'
  }
];

export default function ExchangeSwitcherTabs({ activeExchange, onSelectExchange, exchangeData, currencyPots, theme = 'dark' }) {
  const isLight = theme === 'light';

  return (
    <div className={`px-4 py-3 border-b transition-colors duration-200 ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111827] border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Exchange Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className={`text-xs font-bold mr-1 uppercase tracking-wider ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Market:
          </span>
          {EXCHANGES.map((ex) => {
            const isActive = activeExchange === ex.code;
            const meta = exchangeData?.[ex.code];
            const isOpen = meta?.is_open;
            const phase = meta?.session_phase;

            return (
              <button
                key={ex.code}
                onClick={() => onSelectExchange(ex.code)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 border shadow-sm ${
                  isActive
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-emerald-500/10'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 shadow-emerald-950'
                    : isLight
                      ? 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-sm">{ex.flag}</span>
                <span>{ex.label}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpen
                      ? 'bg-emerald-500 animate-pulse'
                      : phase === 'PRE_MARKET'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                  title={phase || 'CLOSED'}
                />
              </button>
            );
          })}
        </div>

        {/* Currency Pot Balance for Active Exchange */}
        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-3 shadow-inner ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0e17] border-slate-800'
          }`}>
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Available Pot:</span>
            <span className="font-mono font-bold text-emerald-500 text-sm">
              {activeExchange === 'ASX' ? 'A$100,000.00' :
               activeExchange === 'NYSE' ? 'US$65,420.00' :
               activeExchange === 'LSE' ? '£52,180.00' :
               'C$88,500.00'}
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
            }`}>
              {activeExchange === 'ASX' ? 'AUD' : activeExchange === 'NYSE' ? 'USD' : activeExchange === 'LSE' ? 'GBP' : 'CAD'}
            </span>
          </div>

          <div className={`px-3.5 py-1.5 rounded-xl border hidden sm:flex items-center gap-2 shadow-inner ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0e17] border-slate-800'
          }`}>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Day P&L:</span>
            <span className="font-mono font-bold text-emerald-500 text-xs">
              +$1,248.60 (+1.25%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
