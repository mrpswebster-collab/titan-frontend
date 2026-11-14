import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Globe, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  AlertTriangle,
  Zap,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const RUNWAY_TARGETS = [
  {
    ticker: 'FAU',
    name: 'First Au Ltd (ACTIVE)',
    price: 0.160,
    change: 6.7,
    conviction: 'C:9',
    rsi: 49.5,
    macd: 'BULLISH_HOOK',
    obv: 'ACCUMULATING',
    currency: 'AUD',
    sector: 'Victorian Goldfields Exploration',
    kinematics: 'NR7 Volatility Compression + Positive 3-bar MACD slope (+0.042)',
    geology: 'High-grade Victorian epithermal orogenic reef system (Swifts Creek project)',
    riskReward: '4.2:1 (ATR Trailing Stop at $0.142, Harvest Milestone at $0.320)'
  },
  {
    ticker: 'UM1',
    name: 'Unity Metals Ltd (ACTIVE)',
    price: 0.110,
    change: 4.8,
    conviction: 'C:8',
    rsi: 46.2,
    macd: 'BULLISH_HOOK',
    obv: 'SURGING',
    currency: 'AUD',
    sector: 'Base & Precious Metals',
    kinematics: 'Bollinger Band Squeeze with expanding 20-day EMA angle (+18°)',
    geology: 'Near-surface polymetallic VMS massive sulphide target',
    riskReward: '3.6:1 (ATR Trailing Stop at $0.098, Harvest Milestone at $0.220)'
  },
  {
    ticker: 'ARN',
    name: 'Aldoro Resources Limited',
    price: 0.340,
    change: 5.2,
    conviction: 'C:7',
    rsi: 45.8,
    macd: 'BULLISH_HOOK',
    obv: 'SURGING',
    currency: 'AUD',
    sector: 'Lithium & Rubidium Exploration',
    kinematics: 'Coiled spring breakout from 4-week base with surge volume (2.1x)',
    geology: 'Pegmatite dyke swarm with high-purity rubidium & lithium mica',
    riskReward: '3.8:1 (ATR Trailing Stop at $0.295, Harvest Milestone at $0.680)'
  },
  {
    ticker: 'WA1',
    name: 'WA1 Resources Ltd',
    price: 14.50,
    change: 8.2,
    conviction: 'C:9',
    rsi: 54.1,
    macd: 'BULLISH_EXPANSION',
    obv: 'ACCUMULATING',
    currency: 'AUD',
    sector: 'West Arunta Niobium Discovery',
    kinematics: 'Power-thrust kinematic expansion riding 20-day EMA angle (+24°)',
    geology: 'Luni Carbonatite Tier-1 Niobium discovery with high-grade core',
    riskReward: '5.1:1 (ATR Trailing Stop at $13.20, Harvest Milestone at $29.00)'
  }
];

export default function SequencedTradingRunwayModal({
  isOpen,
  onClose,
  activeExchange = 'ASX',
  exchangeData = {},
  userSession = null,
  onStageOrder,
  theme = 'dark'
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStock, setSelectedStock] = useState(RUNWAY_TARGETS[0]);
  const [parcelSizePct, setParcelSizePct] = useState(10); // 10% of portfolio
  const [orderStagedSuccess, setOrderStagedSuccess] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const exMeta = exchangeData?.[activeExchange] || {
    name: 'Australian Securities Exchange',
    session_phase: 'CLOSED',
    is_open: false,
    local_time: '10:00:00'
  };

  const startingCap = userSession?.startingCapital || 25000;
  const parcelValue = (startingCap * (parcelSizePct / 100));
  const chaseLimitPrice = +(selectedStock.price * 1.02).toFixed(4); // 2% chase cap
  const estimatedUnits = Math.floor(parcelValue / chaseLimitPrice);

  const handleExecuteStage = () => {
    if (onStageOrder) {
      onStageOrder({
        ticker: selectedStock.ticker,
        company: selectedStock.name,
        price: chaseLimitPrice,
        currency: selectedStock.currency,
        units: estimatedUnits,
        total: parcelValue,
        atrStop: (selectedStock.price * 0.90).toFixed(4),
        harvestTarget: (selectedStock.price * 2.0).toFixed(4),
        rule: '2% Slippage Cap + Kinematic Vector'
      });
    }
    setOrderStagedSuccess(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setOrderStagedSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b111c] border-slate-800 text-slate-100'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Sequenced Trading Action Runway</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  KINEMATIC &amp; SLIPPAGE GATE
                </span>
              </div>
              <p className="text-xs text-slate-400">Step-by-step institutional trade preparation and parcel staging</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Indicator Bar */}
        <div className={`px-6 py-3 border-b flex items-center justify-between gap-2 overflow-x-auto ${isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#080d15] border-slate-800/80'}`}>
          {[
            { num: 1, label: 'Market Bell', desc: 'Exchange Telemetry' },
            { num: 2, label: 'Kinematic Scan', desc: 'Coiled Springs' },
            { num: 3, label: 'AI Dossier', desc: 'Geologist Review' },
            { num: 4, label: 'Parcel Stage', desc: '2% Slippage Cap' },
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num || orderStagedSuccess;
            return (
              <button
                key={s.num}
                onClick={() => !orderStagedSuccess && setCurrentStep(s.num)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition text-left flex-1 min-w-[130px] border ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : isCompleted
                      ? 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                      : 'border-transparent text-slate-500 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                  isActive
                    ? 'bg-emerald-500 text-black'
                    : isCompleted
                      ? 'bg-slate-700 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Step Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* STEP 1: MARKET BELL & EXCHANGE TELEMETRY */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Step 1: Exchange Telemetry & Market Hours Verification
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Before reviewing kinematic vectors, verify the current market operating window and liquidity depth.
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                  exMeta.session_phase === 'REGULAR'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {exMeta.session_phase || 'MARKET CLOSED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Active Exchange</div>
                  <div className="text-base font-bold text-slate-100 mt-1">{exMeta.name || activeExchange}</div>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5">ASX Gateway Sydney</div>
                </div>

                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Scoped Tenant Fleet</div>
                  <div className="text-base font-bold text-emerald-400 mt-1 truncate">
                    {userSession?.tenantId || 'ADMIN-SOVEREIGN'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">RLS Zero-Trust Bound</div>
                </div>

                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Available Capital Pot</div>
                  <div className="text-base font-bold text-slate-100 mt-1 font-mono">
                    ${startingCap.toLocaleString()} AUD
                  </div>
                  <div className="text-xs text-emerald-400 font-mono mt-0.5">Fractional Half-Kelly Ready</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-200/90 leading-relaxed">
                  <strong>Tri-Timestamp Standard Active:</strong> Exchange bell timestamp, local client clock, and server audit log are synchronised. All subsequent staged limit orders will enforce marketable limit protection (2% slippage cap).
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: KINEMATIC SCANNER COILS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Step 2: Coiled Spring Candidates (Kinematic Filtered)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select the high-conviction candidate to route into autonomous AI Quant & Geologist review.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">{RUNWAY_TARGETS.length} Coiled Springs Detected</span>
              </div>

              <div className="space-y-2.5">
                {RUNWAY_TARGETS.map((t) => {
                  const isSelected = selectedStock.ticker === t.ticker;
                  return (
                    <div
                      key={t.ticker}
                      onClick={() => setSelectedStock(t)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-slate-100 shadow-md shadow-emerald-950/30'
                          : isLight
                            ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono text-sm ${
                          isSelected ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                        }`}>
                          {t.ticker}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{t.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                              {t.conviction}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-sans">
                            {t.sector} • <span className="text-emerald-400 font-mono">{t.kinematics}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-mono font-bold text-sm text-slate-100">
                          ${t.price.toFixed(3)} {t.currency}
                        </div>
                        <div className="text-xs font-mono text-emerald-400 font-semibold">
                          +{t.change}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: AI DOSSIER & GEOLOGIST REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Step 3: Autonomous AI Geologist & Quant Dossier
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synthesising kinematic momentum vectors, orebody grade depth, and structural dilution risk for <strong className="text-slate-200">{selectedStock.ticker}</strong>.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AUTONOMOUS DOSSIER FRESH
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-100">{selectedStock.ticker}</span>
                    <span className="text-xs text-slate-400">— {selectedStock.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">Signal Price: ${selectedStock.price.toFixed(3)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Kinematic 5-Pillar Score
                    </div>
                    <p className="text-slate-300 leading-relaxed">{selectedStock.kinematics}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      RSI: {selectedStock.rsi} | MACD: {selectedStock.macd} | OBV: {selectedStock.obv}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1">
                      ⛏️ Geological / Asset Rigour
                    </div>
                    <p className="text-slate-300 leading-relaxed">{selectedStock.geology}</p>
                    <div className="text-[10px] text-cyan-400 font-mono mt-1">
                      Reward-to-Risk: {selectedStock.riskReward}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300/90 flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Kinematic Momentum Gate PASSED: Minimum 3:1 reward-to-risk ratio confirmed against ATR trailing stop.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PARCEL SIZING & STAGING */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Step 4: Parcel Staging &amp; Sovereign Limit Routing
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stage marketable limit order with strictly enforced 2% slippage cap and 2-stage free ride auto-harvest.
                  </p>
                </div>
              </div>

              {orderStagedSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto text-xl">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-emerald-300">ORDER STAGED SUCCESSFULLY!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed font-sans">
                    Staged <strong>{estimatedUnits.toLocaleString()} units</strong> of <strong>{selectedStock.ticker}</strong> at marketable limit ceiling <strong>${chaseLimitPrice} AUD</strong> into active workbook ledger.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      Run Another Sequence
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-lg shadow-emerald-950"
                    >
                      Return to Workspace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Allocation Slider */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300 font-bold">Fractional Parcel Size (Half-Kelly)</span>
                      <span className="font-mono font-bold text-emerald-400">{parcelSizePct}% of Pot (${parcelValue.toLocaleString()} AUD)</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="25"
                      step="1"
                      value={parcelSizePct}
                      onChange={(e) => setParcelSizePct(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>2% (Conservative)</span>
                      <span>10% (Balanced Half-Kelly)</span>
                      <span>25% (Maximum Cap)</span>
                    </div>
                  </div>

                  {/* Order Specs Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                      <div className="text-[10px] text-slate-400">SIGNAL PRICE</div>
                      <div className="font-bold text-slate-200 mt-1">${selectedStock.price.toFixed(3)}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                      <div className="text-[10px] text-emerald-400">CHASE CAP (2%)</div>
                      <div className="font-bold text-emerald-300 mt-1">${chaseLimitPrice}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                      <div className="text-[10px] text-slate-400">EST. UNITS</div>
                      <div className="font-bold text-slate-200 mt-1">{estimatedUnits.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                      <div className="text-[10px] text-cyan-400">FREE RIDE (+100%)</div>
                      <div className="font-bold text-cyan-300 mt-1">${(selectedStock.price * 2).toFixed(3)}</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-300/90 font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Slippage Protection:</strong> Market orders prohibited on small-caps. Transmitting order as a Marketable Limit Order capped at ${chaseLimitPrice}.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        {!orderStagedSuccess && (
          <div className={`px-6 py-4 border-t flex items-center justify-between gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-800'}`}>
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                currentStep === 1
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 mr-2">
                Step {currentStep} of 4
              </span>
              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-lg shadow-emerald-950"
                >
                  <span>Proceed to Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleExecuteStage}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-extrabold transition shadow-lg shadow-emerald-950 animate-pulse"
                >
                  <Zap className="w-4 h-4" />
                  <span>TRANSMIT MARKETABLE LIMIT ORDER</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
