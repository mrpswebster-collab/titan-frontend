import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  LayoutGrid,
  Briefcase,
  Cpu,
  Database,
  FlaskConical,
  Key,
  SlidersHorizontal,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function EnclaveDropdownMenu({
  activeMainTab,
  onSelectTab,
  layoutMode,
  onToggleLayoutMode,
  onOpenGuide,
  onOpenBacktest,
  theme = 'dark'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isLight = theme === 'light';
  const isMobileMode = layoutMode === 'MOBILE';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setPersistedLayout = (nextMode) => {
    try {
      localStorage.setItem('titan_layout_mode', nextMode);
    } catch (e) {}
    onToggleLayoutMode(nextMode);
  };

  const menuItems = [
    {
      category: 'ANALYTICS & TRADE SCREENS',
      items: [
        {
          id: 'SCANNER',
          label: 'Markets & Trade Scanner',
          desc: 'Rule 53 Coiled Spring breakouts & live signals',
          icon: LayoutGrid,
          badge: 'Live',
          badgeColor: 'emerald',
          action: () => {
            if (layoutMode === 'COCKPIT') setPersistedLayout('STANDARD');
            onSelectTab('SCANNER');
            setIsOpen(false);
          }
        },
        {
          id: 'PORTFOLIO',
          label: 'Portfolio & P&L Analytics',
          desc: 'Real-time equity, P&L, and Day-0 Signal Inception',
          icon: Briefcase,
          action: () => {
            if (layoutMode === 'COCKPIT') setPersistedLayout('STANDARD');
            onSelectTab('PORTFOLIO');
            setIsOpen(false);
          }
        },
        {
          id: 'AI_TERMINAL',
          label: 'AI Analyst Terminal',
          desc: 'Geologist, Biotech, Tech & Risk AI personas',
          icon: Cpu,
          badge: '4 Agents',
          badgeColor: 'purple',
          action: () => {
            if (layoutMode === 'COCKPIT') setPersistedLayout('STANDARD');
            onSelectTab('AI_TERMINAL');
            setIsOpen(false);
          }
        },
        {
          id: 'BACKTEST',
          label: 'Backtest Simulation Lab',
          desc: 'Test 2,000% Moonshot & Harvesting strategies',
          icon: FlaskConical,
          action: () => {
            if (onOpenBacktest) onOpenBacktest();
            setIsOpen(false);
          }
        }
      ]
    },
    ...(isMobileMode
      ? []
      : [
          {
            category: 'ADMIN & SETUP (WEBPAGE ONLY)',
            items: [
              {
                id: 'FLEET_SETUP',
                label: 'Fleet & Enclave Setup',
                desc: 'Multi-workbooks, VIP invites, FastMCP & Sentinel',
                icon: Database,
                badge: 'Setup Hub',
                badgeColor: 'cyan',
                action: () => {
                  setPersistedLayout('STANDARD');
                  onSelectTab('FLEET_SETUP');
                  try {
                    window.history.pushState(null, '', '/setup');
                  } catch (e) {}
                  setIsOpen(false);
                }
              },
              {
                id: 'COCKPIT',
                label: 'Quant Cockpit (Pro)',
                desc: 'Direct full-screen institutional terminal',
                icon: SlidersHorizontal,
                badge: 'Pro Mode',
                badgeColor: 'amber',
                action: () => {
                  setPersistedLayout('COCKPIT');
                  setIsOpen(false);
                }
              }
            ]
          }
        ]),
    {
      category: 'DISPLAY MODE & WEBPAGE SWITCH',
      items: [
        {
          id: 'MOBILE_MODE',
          label: 'Mobile Phone Mode',
          desc: 'Limited display: Analytics & Trade screens only',
          icon: Smartphone,
          badge: 'Pocket UI',
          badgeColor: 'cyan',
          action: () => {
            setPersistedLayout('MOBILE');
            if (activeMainTab === 'FLEET_SETUP') onSelectTab('SCANNER');
            setIsOpen(false);
          }
        },
        {
          id: 'STANDARD_MODE',
          label: 'Full Webpage Mode',
          desc: 'Complete Enclave, Google Sheets Auto-Builder & Setup',
          icon: Monitor,
          badge: 'Desktop',
          badgeColor: 'emerald',
          action: () => {
            setPersistedLayout('STANDARD');
            setIsOpen(false);
          }
        },
        {
          id: 'GUIDE',
          label: 'Platform User Guide',
          desc: 'Step-by-step enclave navigation tutorial',
          icon: BookOpen,
          action: () => {
            if (onOpenGuide) onOpenGuide();
            setIsOpen(false);
          }
        }
      ]
    }
  ];

  // Get label of current active view
  const getCurrentLabel = () => {
    if (layoutMode === 'COCKPIT') return 'Quant Cockpit (Pro)';
    if (layoutMode === 'MOBILE') {
      switch (activeMainTab) {
        case 'SCANNER': return '📱 Trade Scanner';
        case 'PORTFOLIO': return '📱 Portfolio P&L';
        case 'AI_TERMINAL': return '📱 AI Analytics';
        default: return '📱 Mobile Mode';
      }
    }
    switch (activeMainTab) {
      case 'SCANNER': return 'Markets & Scanner';
      case 'PORTFOLIO': return 'My Portfolio & Holdings';
      case 'AI_TERMINAL': return 'AI Analyst Terminal';
      case 'FLEET_SETUP': return 'Fleet & Setup';
      default: return 'Enclave Menu';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button with rounded edges & soft shadow */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
          isOpen
            ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
            : isLight
              ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-[#0f172a] hover:bg-slate-800 text-slate-200 border-slate-700'
        }`}
        title="Open Enclave Navigation & Setup Dropdown Menu"
      >
        <Menu className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-sans font-semibold">Menu</span>
        <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
          {getCurrentLabel()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Floating Menu with smooth elevation shadow */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900 shadow-slate-400/30'
            : 'bg-[#0b121e]/95 backdrop-blur-md border-slate-700/80 text-slate-100 shadow-black/80'
        }`}>
          <div className="space-y-3 p-1">
            {menuItems.map((sec, secIdx) => (
              <div key={sec.category} className={secIdx > 0 ? `pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'}` : ''}>
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {sec.category}
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = 
                      (item.id === 'COCKPIT' && layoutMode === 'COCKPIT') ||
                      (item.id === 'MOBILE_MODE' && layoutMode === 'MOBILE') ||
                      (item.id === 'STANDARD_MODE' && layoutMode === 'STANDARD') ||
                      (layoutMode !== 'COCKPIT' && activeMainTab === item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className={`w-full flex items-start gap-3 p-2 rounded-xl text-left transition ${
                          isCurrent
                            ? isLight
                              ? 'bg-emerald-50 text-emerald-950 font-medium'
                              : 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/30 font-medium'
                            : isLight
                              ? 'hover:bg-slate-100 text-slate-700'
                              : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-bold truncate">{item.label}</span>
                            {item.badge && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase font-bold shrink-0 ${
                                item.badgeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                                item.badgeColor === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                item.badgeColor === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {item.desc}
                          </p>
                        </div>
                        {isCurrent && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 self-center" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
