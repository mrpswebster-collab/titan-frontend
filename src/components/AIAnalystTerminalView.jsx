import React, { useState } from 'react';
import { Cpu, Send, Sparkles, Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AIAnalystTerminalView({ onStageFromAI }) {
  const [ticker, setTicker] = useState('WA1');
  const [exchange, setExchange] = useState('ASX');
  const [persona, setPersona] = useState('Materials, Mining & Exploration (Geologist / Assay Auditor)');
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

  const handleRunAnalysis = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const res = await fetch('https://asx-quant-brain.onrender.com/api/v2/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Prompt Input Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>TITAN AI Sector Intelligence Terminal</span>
              <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                Gemini 2.0 Cascade
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Query any global ticker to generate a rigorous quantitative thesis tailored by specialized sector personas.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">TICKER</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. WA1, NVDA"
              className="w-full bg-[#0a0e17] border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">EXCHANGE</label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full bg-[#0a0e17] border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="ASX">ASX (Australia)</option>
              <option value="NYSE">NYSE / NASDAQ (Wall St)</option>
              <option value="LSE">LSE (London)</option>
              <option value="TSX">TSX (Toronto)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] text-slate-400 block mb-1">AI SECTOR PERSONA</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full bg-[#0a0e17] border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="Materials, Mining & Exploration (Geologist / Assay Auditor)">
                ⛏️ Exploration Geologist (Assay Grades & Dilution)
              </option>
              <option value="Healthcare, Pharma & Biotech (Clinical Regulatory Auditor)">
                🧬 Biotech Auditor (FDA Readouts & Endpoints)
              </option>
              <option value="Technology, Defense & SaaS (Momentum Growth Specialist)">
                💻 Tech & Defense (ARR Growth & Contract Wins)
              </option>
              <option value="Institutional Quantitative Risk Officer">
                🛡️ Portfolio Risk Officer (FCF Yield & Balance Sheet)
              </option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-purple-950 flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{loading ? 'Synthesizing Intelligence Dossier...' : `Generate ${ticker} Intelligence Dossier`}</span>
        </button>
      </div>

      {/* Generated Dossier Card */}
      {dossier && (
        <div className="bg-[#111827] border border-purple-900/40 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-slate-100">{dossier.ticker}</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {dossier.directive}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Conviction {dossier.conviction_score}
              </span>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Persona: <strong className="text-purple-300">{dossier.persona_applied}</strong>
            </span>
          </div>

          {/* Thesis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Autonomous Qualitative & Technical Synthesis
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-sans bg-[#0a0e17] p-4 rounded-xl border border-slate-800/80">
              {dossier.intelligence_thesis}
            </p>
          </div>

          {/* Key Catalyst */}
          <div className="bg-purple-950/20 border border-purple-800/40 p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-purple-300 block mb-0.5">Primary Quantitative Catalyst:</span>
              <span className="text-purple-200/90">{dossier.key_catalyst}</span>
            </div>
          </div>

          {/* Kinematic Snapshot */}
          {dossier.kinematics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="bg-[#0a0e17] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MACD HOOK</span>
                <span className="text-emerald-400 font-bold">{dossier.kinematics.macd_hook}</span>
              </div>
              <div className="bg-[#0a0e17] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">WILDER'S RSI (14)</span>
                <span className="text-cyan-400 font-bold">{dossier.kinematics.rsi_14}</span>
              </div>
              <div className="bg-[#0a0e17] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OBV ACCUMULATION</span>
                <span className="text-amber-400 font-bold">{dossier.kinematics.obv_status}</span>
              </div>
              <div className="bg-[#0a0e17] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">2% CHASE CEILING</span>
                <span className="text-emerald-400 font-bold">${dossier.kinematics.chase_limit_ceiling}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
