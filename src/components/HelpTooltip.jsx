import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function HelpTooltip({ title, text, theme = 'dark' }) {
  const [isOpen, setIsOpen] = useState(false);

  const isLight = theme === 'light';

  return (
    <div className="relative inline-flex items-center ml-1 z-30">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-0.5 rounded-full transition ${
          isLight 
            ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' 
            : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
        }`}
        aria-label="Help info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl shadow-2xl text-xs font-normal z-50 pointer-events-none transition-all duration-200 ${
            isLight
              ? 'bg-white border border-slate-200 text-slate-800 shadow-slate-300/60'
              : 'bg-[#111827] border border-slate-700 text-slate-200 shadow-black/80'
          }`}
        >
          {title && (
            <div className={`font-bold mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${
              isLight ? 'text-emerald-700' : 'text-emerald-400'
            }`}>
              <span>💡</span> {title}
            </div>
          )}
          <div className="leading-relaxed text-[11px]">{text}</div>
          {/* Subtle Arrow */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${
              isLight ? 'border-t-white' : 'border-t-[#111827]'
            }`}
          />
        </div>
      )}
    </div>
  );
}
