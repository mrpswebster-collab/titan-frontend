import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Database,
  Briefcase,
  Layers,
  Search,
  Zap,
  Edit3
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';

const DEFAULT_TARGETS_BY_EXCHANGE = {
  ASX: [
    { ticker: 'WA1', name: 'WA1 Resources Ltd', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'FAU', name: 'First Au Ltd (Active)', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'UM1', name: 'Unity Metals Ltd (Active)', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'DRO', name: 'Droneshield Limited', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'SCP', name: 'Scalare Partners', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'ARN', name: 'Aldoro Resources', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'PLS', name: 'Pilbara Minerals', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'NST', name: 'Northern Star Resources', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'CU6', name: 'Clarity Pharmaceuticals', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'NEU', name: 'Neuren Pharmaceuticals', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'TLX', name: 'Telix Pharmaceuticals', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'DXB', name: 'Dimerix Limited', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'CSL', name: 'CSL Limited', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'BHP', name: 'BHP Group', sector: 'RISK', persona: 'Institutional Quantitative Risk Officer' },
    { ticker: 'CBA', name: 'Commonwealth Bank', sector: 'RISK', persona: 'Institutional Quantitative Risk Officer' }
  ],
  NYSE: [
    { ticker: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'CRSP', name: 'CRISPR Therapeutics', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'SOUN', name: 'SoundHound AI Inc', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'ASTS', name: 'AST SpaceMobile', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'ACHR', name: 'Archer Aviation', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'CRWD', name: 'CrowdStrike Holdings', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'IONQ', name: 'IonQ Inc', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'RGTI', name: 'Rigetti Computing', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' }
  ],
  LSE: [
    { ticker: 'PREM', name: 'Premier African Minerals', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'KOD', name: 'Kodal Minerals PLC', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'GGP', name: 'Greatland Gold PLC', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'RR', name: 'Rolls-Royce Holdings', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' },
    { ticker: 'AZN', name: 'AstraZeneca PLC', sector: 'BIOTECH', persona: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)' },
    { ticker: 'SHEL', name: 'Shell PLC', sector: 'RISK', persona: 'Institutional Quantitative Risk Officer' }
  ],
  TSX: [
    { ticker: 'PMET', name: 'Patriot Battery Metals', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'FIL', name: 'Filo Mining Corp', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'IVN', name: 'Ivanhoe Mines Ltd', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'EU', name: 'EnCore Energy Corp', sector: 'MINING', persona: 'Materials, Mining & Exploration (Geologist / Assay Auditor)' },
    { ticker: 'SHOP', name: 'Shopify Inc', sector: 'TECH', persona: 'Technology, Defense & SaaS (Momentum Growth Specialist)' }
  ]
};

const PERSONA_OPTIONS = [
  {
    value: 'Materials, Mining & Exploration (Geologist / Assay Auditor)',
    label: '⛏️ Exploration Geologist (Assay Grades & Dilution)',
    desc: 'Exploration assays, drill grade-thickness & commodity trends'
  },
  {
    value: 'Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)',
    label: '🧬 Biotech & Pharma Auditor (Phase 2/3 FDA Readouts & 12-Mo Runway)',
    desc: 'Phase 2/3 trial endpoints, FDA/TGA readouts, 12-mo cash runway & anti-FOMO gate'
  },
  {
    value: 'Technology, Defense & SaaS (Momentum Growth Specialist)',
    label: '💻 Tech & Defense (ARR Growth & Contract Wins)',
    desc: 'ARR growth, sovereign contract wins & volume waves'
  },
  {
    value: 'Institutional Quantitative Risk Officer',
    label: '🛡️ Portfolio Risk Officer (FCF Yield & Balance Sheet)',
    desc: 'Balance sheet durability, FCF yield & drawdown gates'
  }
];

export default function AIAnalystTerminalView({
  onStageFromAI,
  userSession,
  activeExchange = 'ASX',
  theme = 'dark'
}) {
  const isLight = theme === 'light';

  const [exchange, setExchange] = useState(activeExchange || 'ASX');
  const [ticker, setTicker] = useState('WA1');
  const [customTicker, setCustomTicker] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [persona, setPersona] = useState('Materials, Mining & Exploration (Geologist / Assay Auditor)');

  // Workbook fleet state
  const [workbooks, setWorkbooks] = useState([]);
  const [selectedWorkbook, setSelectedWorkbook] = useState('ALL');
  const [holdings, setHoldings] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(false);

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState({
    ticker: 'WA1',
    exchange: 'ASX',
    directive: 'AI BUY',
    conviction_score: 'C:9',
    persona_applied: 'Exploration Geologist & Assay Auditor',
    intelligence_thesis: 'Assay drill disclosure on WA1 exhibits exceptional grade-thickness continuity in West Arunta Luni carbonatite. Intercept widths (42m @ 2.4% Nb2O5) confirm world-class high-grade niobium mineralisation. Spot commodity pricing remains accretive. Estimated cash runway exceeds 14 months post-institutional placement, eliminating near-term capital raise dilution risk.',
    key_catalyst: 'Phase 2 step-out diamond drilling assay results & maiden resource estimate.',
    kinematics: {
      macd_hook: 'BULLISH_HOOK',
      rsi_14: 48.2,
      obv_status: 'ACCUMULATING',
      chase_limit_ceiling: 14.79
    }
  });

  // Fetch workbooks & holdings to populate dropdown from real user ledger
  const fetchWorkbookHoldings = async () => {
    setLoadingFleet(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/portfolio/fleet`, {
        headers: {
          'Authorization': `Bearer ${userSession?.idToken || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkbooks(data.workbooks || []);
        setHoldings(data.holdings || []);
        // If holdings exist, default initial ticker to first holding
        if (data.holdings?.length > 0 && !isCustomMode) {
          const first = data.holdings[0];
          setTicker(first.ticker);
          if (first.exchange) setExchange(first.exchange);
        }
      }
    } catch (e) {
      console.warn('Workbook fleet fetch notice:', e);
    } finally {
      setLoadingFleet(false);
    }
  };

  useEffect(() => {
    fetchWorkbookHoldings();
  }, [userSession?.idToken]);

  // Filter holdings based on selected workbook
  const filteredHoldings = selectedWorkbook === 'ALL'
    ? holdings
    : holdings.filter(h => h.workbook === selectedWorkbook);

  // Active exchange watchlist targets
  const watchlistTargets = DEFAULT_TARGETS_BY_EXCHANGE[exchange] || DEFAULT_TARGETS_BY_EXCHANGE.ASX;

  // Handle ticker selection from dropdown
  const handleSelectTicker = (selectedVal) => {
    if (selectedVal === '__CUSTOM__') {
      setIsCustomMode(true);
      return;
    }
    setIsCustomMode(false);
    setTicker(selectedVal);

    // Auto-detect matching persona based on ticker
    const matchTarget = watchlistTargets.find(t => t.ticker === selectedVal);
    if (matchTarget?.persona) {
      setPersona(matchTarget.persona);
    } else {
      const matchHolding = holdings.find(h => h.ticker === selectedVal);
      if (matchHolding) {
        const name = (matchHolding.company || '').toLowerCase();
        if (name.includes('metal') || name.includes('gold') || name.includes('mineral') || name.includes('lithium') || name.includes('au')) {
          setPersona('Materials, Mining & Exploration (Geologist / Assay Auditor)');
        } else if (name.includes('tech') || name.includes('partner') || name.includes('ai') || name.includes('soft')) {
          setPersona('Technology, Defense & SaaS (Momentum Growth Specialist)');
        } else if (name.includes('bio') || name.includes('pharma') || name.includes('health')) {
          setPersona('Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)');
        }
      }
    }
  };

  // Run quantitative synthesis
  const handleRunAnalysis = async () => {
    const targetTicker = isCustomMode ? customTicker.toUpperCase().trim() : ticker;
    if (!targetTicker) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/agent/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: targetTicker,
          exchange,
          sector_persona: persona,
          price: 14.50
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
      }
    } catch (e) {
      console.warn('AI analysis API notice:', e);
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111827] border-slate-800';
  const subCardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0e17] border-slate-800';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. Header & Configuration Card */}
      <div className={`rounded-2xl border p-5 sm:p-6 shadow-xl transition-all ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold flex items-center gap-2 ${textPrimary}`}>
                  TITAN AI Sector Intelligence Terminal
                </h2>
                <span className="text-[10px] font-mono bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold">
                  Gemini 2.0 Cascade
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${textMuted}`}>
                Select any ticker from your active workbook or regional sniper watchlists to generate an institutional thesis.
              </p>
            </div>
          </div>

          {/* Active Workbook Indicator Badge */}
          {workbooks.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Workbook:</span>
              <strong className="text-emerald-400 truncate max-w-[150px]">
                {workbooks.find(w => w.id === selectedWorkbook)?.name || 'Consolidated Fleet'}
              </strong>
            </div>
          )}
        </div>

        {/* 2. Interactive Dropdown Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 font-mono text-xs">
          
          {/* CONTROL A: WORKBOOK FILTER (if multiple workbooks) */}
          {workbooks.length > 1 && (
            <div>
              <label className={`text-[10px] uppercase font-bold block mb-1.5 ${textMuted}`}>
                1. FILTER WORKBOOK
              </label>
              <select
                value={selectedWorkbook}
                onChange={(e) => setSelectedWorkbook(e.target.value)}
                className={`w-full rounded-xl px-3 py-2.5 font-bold outline-none border transition ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500'
                    : 'bg-[#0a0e17] border-slate-800 text-slate-100 focus:border-purple-500'
                }`}
              >
                <option value="ALL">Consolidated (All Nodes)</option>
                {workbooks.map(wb => (
                  <option key={wb.id} value={wb.id}>
                    {wb.name} ({wb.exchange || 'ASX'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CONTROL B: TICKER DROPDOWN (POPULATED FROM WORKBOOK & TARGETS) */}
          <div className={workbooks.length > 1 ? 'md:col-span-1' : 'md:col-span-1'}>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-[10px] uppercase font-bold block ${textMuted}`}>
                {workbooks.length > 1 ? '2.' : '1.'} SELECT TICKER
              </label>
              {isCustomMode ? (
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-sans font-bold cursor-pointer"
                >
                  <span>Use Dropdown</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-sans font-bold cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Type Custom</span>
                </button>
              )}
            </div>

            {isCustomMode ? (
              <div className="relative">
                <input
                  type="text"
                  value={customTicker}
                  onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                  placeholder="e.g. WA1, BHP"
                  autoFocus
                  className={`w-full rounded-xl px-3 py-2.5 font-bold outline-none border transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500'
                      : 'bg-[#0a0e17] border-slate-800 text-slate-100 focus:border-purple-500'
                  }`}
                />
              </div>
            ) : (
              <select
                value={ticker}
                onChange={(e) => handleSelectTicker(e.target.value)}
                className={`w-full rounded-xl px-3 py-2.5 font-bold outline-none border transition ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500'
                    : 'bg-[#0a0e17] border-slate-800 text-slate-100 focus:border-purple-500'
                }`}
              >
                {/* GROUP 1: WORKBOOK HOLDINGS */}
                {filteredHoldings.length > 0 && (
                  <optgroup label="💼 Active Workbook Holdings">
                    {filteredHoldings.map((h) => (
                      <option key={`hold-${h.workbook}-${h.ticker}`} value={h.ticker}>
                        {h.ticker} — {h.company || 'Holding'} (Pos: {h.units || 0})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* GROUP 2: COILED SPRING WATCHLIST TARGETS */}
                <optgroup label={`🎯 ${exchange} Coiled Spring Watchlist`}>
                  {watchlistTargets.map((item) => (
                    <option key={`target-${item.ticker}`} value={item.ticker}>
                      {item.ticker} — {item.name}
                    </option>
                  ))}
                </optgroup>

                {/* OPTION 3: CUSTOM ENTRY TRIGGER */}
                <optgroup label="✏️ Other">
                  <option value="__CUSTOM__">✍️ Type Custom Worldwide Ticker...</option>
                </optgroup>
              </select>
            )}
          </div>

          {/* CONTROL C: EXCHANGE SELECTOR */}
          <div>
            <label className={`text-[10px] uppercase font-bold block mb-1.5 ${textMuted}`}>
              EXCHANGE
            </label>
            <select
              value={exchange}
              onChange={(e) => {
                setExchange(e.target.value);
                const nextTargets = DEFAULT_TARGETS_BY_EXCHANGE[e.target.value] || [];
                if (nextTargets.length > 0 && !isCustomMode) {
                  setTicker(nextTargets[0].ticker);
                  setPersona(nextTargets[0].persona);
                }
              }}
              className={`w-full rounded-xl px-3 py-2.5 font-bold outline-none border transition ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500'
                  : 'bg-[#0a0e17] border-slate-800 text-slate-100 focus:border-purple-500'
              }`}
            >
              <option value="ASX">ASX (Australia AUD)</option>
              <option value="NYSE">NYSE / NASDAQ (Wall St USD)</option>
              <option value="LSE">LSE (London GBP)</option>
              <option value="TSX">TSX (Toronto CAD)</option>
            </select>
          </div>

          {/* CONTROL D: AI SECTOR PERSONA */}
          <div className={workbooks.length > 1 ? 'md:col-span-1' : 'md:col-span-2'}>
            <label className={`text-[10px] uppercase font-bold block mb-1.5 ${textMuted}`}>
              QUANT SECTOR PERSONA
            </label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className={`w-full rounded-xl px-3 py-2.5 font-bold outline-none border transition ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500'
                  : 'bg-[#0a0e17] border-slate-800 text-slate-100 focus:border-purple-500'
              }`}
            >
              {PERSONA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Action Button */}
        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="w-full mt-5 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-purple-950 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>
            {loading 
              ? `Synthesizing ${isCustomMode ? customTicker : ticker} Intelligence Dossier...` 
              : `Generate ${isCustomMode ? customTicker || 'Custom' : ticker} Institutional Dossier`}
          </span>
        </button>
      </div>

      {/* 4. Generated Intelligence Dossier Card */}
      {dossier && (
        <div className={`rounded-2xl border p-6 shadow-2xl space-y-5 transition-all ${
          isLight ? 'bg-white border-purple-200 shadow-purple-500/10' : 'bg-[#111827] border-purple-900/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <span className={`font-mono text-2xl font-bold ${textPrimary}`}>
                {dossier.ticker}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {dossier.directive}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Conviction {dossier.conviction_score}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${textMuted}`}>
                Persona: <strong className="text-purple-400">{dossier.persona_applied}</strong>
              </span>

              {onStageFromAI && (
                <button
                  type="button"
                  onClick={() => onStageFromAI(dossier.ticker)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-sm transition"
                  title="Stage Limit Order in Cockpit (Rule 24 2% Cap)"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Stage {dossier.directive}</span>
                </button>
              )}
            </div>
          </div>

          {/* Qualitative Synthesis Thesis */}
          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>
              Autonomous Qualitative & Technical Synthesis
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed font-sans p-4 rounded-xl border ${subCardBg} ${textPrimary}`}>
              {dossier.intelligence_thesis}
            </p>
          </div>

          {/* Primary Catalyst */}
          <div className={`p-4 rounded-xl flex items-start gap-3 border ${
            isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-950/20 border-purple-800/40'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-purple-400 block mb-0.5">Primary Quantitative Catalyst:</span>
              <span className={isLight ? 'text-purple-950' : 'text-purple-200'}>
                {dossier.key_catalyst}
              </span>
            </div>
          </div>

          {/* Kinematic Snapshot */}
          {dossier.kinematics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className={`p-3 rounded-xl border ${subCardBg}`}>
                <span className={`block text-[10px] ${textMuted}`}>MACD HOOK</span>
                <span className="text-emerald-400 font-bold">{dossier.kinematics.macd_hook}</span>
              </div>
              <div className={`p-3 rounded-xl border ${subCardBg}`}>
                <span className={`block text-[10px] ${textMuted}`}>WILDER'S RSI (14)</span>
                <span className="text-cyan-400 font-bold">{dossier.kinematics.rsi_14}</span>
              </div>
              <div className={`p-3 rounded-xl border ${subCardBg}`}>
                <span className={`block text-[10px] ${textMuted}`}>OBV ACCUMULATION</span>
                <span className="text-amber-400 font-bold">{dossier.kinematics.obv_status}</span>
              </div>
              <div className={`p-3 rounded-xl border ${subCardBg}`}>
                <span className={`block text-[10px] ${textMuted}`}>2% CHASE CEILING</span>
                <span className="text-emerald-400 font-bold">${dossier.kinematics.chase_limit_ceiling}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
