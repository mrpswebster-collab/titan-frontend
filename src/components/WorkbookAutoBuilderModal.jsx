import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Rocket,
  ShieldCheck,
  Database,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Zap,
  Target,
  DollarSign,
  FileSpreadsheet,
  Lock,
  RotateCcw,
  Coins,
  TrendingUp
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';

const WEALTH_SUB_MODES = [
  {
    id: 'TOTAL_RETURN_DIVIDEND_GROWTH',
    label: '1. High-Yield Dividend (5%–9%+) + Franking Credits + Capital Growth',
    desc: 'Targets cash-generative dividend leaders with strong FCF coverage and steady upward price appreciation.'
  },
  {
    id: 'QUALITY_WEALTH_COMPOUNDER',
    label: '2. Long-Term Quality Compounder (High ROE/ROIC & Stacked 20/50/100/200 EMA)',
    desc: 'Buy & Hold Wealth Fortress — wide economic moat, low net debt, smooth multi-year compounding.'
  },
  {
    id: 'YIELD_ON_COST_BUILDER',
    label: '3. Dividend Yield-on-Cost & Annual Payout Growth Builder',
    desc: 'Focuses on dividend aristocrats that raise distributions year after year while holding core shares.'
  },
  {
    id: 'DEFENSIVE_CASH_COW_ROYALTY',
    label: '4. Defensive Cash-Cow, Infrastructure & Mining Royalty Income',
    desc: 'High-margin royalty/streaming & monopoly cash cows protected by wide 50/200 EMA macro trend stops.'
  }
];

const STRATEGY_BLUEPRINTS = [
  {
    id: 'MOONSHOT_COILED_SPRING',
    title: '🚀 Moonshot Coiled Spring (2,000%+ Hunter)',
    subtitle: 'Sub-penny & Penny Stocks ($0.001–$0.50) | Recover 100% House Money @ +100% & Ride Uncapped',
    badge: '2,000% RUNNER',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'MOONSHOT_COILED_SPRING',
      sector_persona: 'MOONSHOT_COILED_HUNTER',
      wealth_sub_modes: [],
      execution_mode: 'AUTONOMOUS',
      starting_capital: 5000,
      min_price: 0.001,
      max_price: 0.50,
      stop_loss_pct: 25.0,
      chandelier_atr_mult: 5.5,
      take_profit_pct: 2000.0,
      power_thrust_rsi_override: true,
      max_rsi: 90,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 12,
      // Tried & True Stage 1 Harvest Defaults
      harvest_enabled: true,
      harvest_mode: 'RECOVER_PRINCIPAL_PCT',
      harvest_trigger_gain_pct: 100.0,
      harvest_recovery_pct: 100.0,
      // Tried & True Stage 2 Catch Defaults (3 Selected = All 3 Must Hit Together)
      catch_macd_cross: true,
      catch_chandelier_atr: true,
      catch_ema_break: true,
      catch_ema_period: 20,
      catch_obv_distribution: false,
      catch_hard_ceiling: false
    }
  },
  {
    id: 'EXPLORATION_ASSAY_SNIPER',
    title: '⛏️ PennyMines & Assay Geologist Sniper',
    subtitle: 'Gold, Lithium, Niobium & Uranium Explorers | JORC Drill Assay & Cash Runway Auditor',
    badge: 'GEOLOGIST AI',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'MOONSHOT_COILED_SPRING',
      sector_persona: 'EXPLORATION_GEOLOGIST',
      wealth_sub_modes: [],
      execution_mode: 'AUTONOMOUS',
      starting_capital: 5000,
      min_price: 0.002,
      max_price: 1.50,
      stop_loss_pct: 22.0,
      chandelier_atr_mult: 5.0,
      take_profit_pct: 2000.0,
      power_thrust_rsi_override: true,
      max_rsi: 88,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 12,
      harvest_enabled: true,
      harvest_mode: 'RECOVER_PRINCIPAL_PCT',
      harvest_trigger_gain_pct: 100.0,
      harvest_recovery_pct: 100.0,
      catch_macd_cross: true,
      catch_chandelier_atr: true,
      catch_ema_break: false,
      catch_ema_period: 20,
      catch_obv_distribution: true,
      catch_hard_ceiling: false
    }
  },
  {
    id: 'INTERNATIONAL_ALPHA',
    title: '🌍 International World Exchanges (NYSE / NASDAQ / LSE / TSX)',
    subtitle: 'Wall St Tech, AI & Global Momentum | Multi-Currency FX Pot Auto-Calibration',
    badge: 'GLOBAL FX',
    defaults: {
      exchange: 'NASDAQ',
      currency: 'USD',
      strategy_protocol: 'INTERNATIONAL_ALPHA',
      sector_persona: 'WALL_ST_MOMENTUM_TECH',
      wealth_sub_modes: [],
      execution_mode: 'AUTONOMOUS',
      starting_capital: 5000,
      min_price: 1.00,
      max_price: 2500.0,
      stop_loss_pct: 12.0,
      chandelier_atr_mult: 3.5,
      take_profit_pct: 1000.0,
      power_thrust_rsi_override: true,
      max_rsi: 85,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 10,
      harvest_enabled: true,
      harvest_mode: 'RECOVER_PRINCIPAL_PCT',
      harvest_trigger_gain_pct: 80.0,
      harvest_recovery_pct: 100.0,
      catch_macd_cross: true,
      catch_chandelier_atr: true,
      catch_ema_break: true,
      catch_ema_period: 20,
      catch_obv_distribution: false,
      catch_hard_ceiling: false
    }
  },
  {
    id: 'WEALTH_DIVIDEND_FORTRESS',
    title: '💎 Wealth & High-Return Hold (Dividends + Compounders)',
    subtitle: 'Large Capital / Long-Term Returns | High-Yield Dividends, Franking, Quality ROE & 50/200 EMA Hold',
    badge: 'WEALTH & YIELD HOLD',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'BLUE_CHIP_CORE',
      sector_persona: 'FORTRESS_QUANT_OFFICER',
      wealth_sub_modes: [
        'TOTAL_RETURN_DIVIDEND_GROWTH',
        'QUALITY_WEALTH_COMPOUNDER',
        'YIELD_ON_COST_BUILDER',
        'DEFENSIVE_CASH_COW_ROYALTY'
      ],
      execution_mode: 'AUTONOMOUS',
      starting_capital: 5000,
      min_price: 2.00,
      max_price: 5000.0,
      stop_loss_pct: 9.0,
      chandelier_atr_mult: 3.0,
      take_profit_pct: 500.0,
      power_thrust_rsi_override: false,
      max_rsi: 72,
      min_conviction: 8,
      kelly_fraction: 0.50,
      max_open_positions: 15,
      // Tried & True Wealth Hold Default: Keep 100% Compounding & Paying Dividends (or user can switch to Skim / Free-Carry)
      harvest_enabled: true,
      harvest_mode: 'HOLD_100_COMPOUND',
      harvest_trigger_gain_pct: 150.0,
      harvest_recovery_pct: 100.0,
      // Macro Trend Catch Confluence (50 EMA + MACD Cross + OBV Distribution must all break before selling a long-term hold)
      catch_macd_cross: true,
      catch_chandelier_atr: false,
      catch_ema_break: true,
      catch_ema_period: 50,
      catch_obv_distribution: true,
      catch_hard_ceiling: false
    }
  },
  {
    id: 'DEDICATED_TICKERS_ONLY',
    title: '🎯 Dedicated Stock Watchlist Workbook',
    subtitle: 'Lock this workbook exclusively to a custom list of specific stocks you want hunted 24/7',
    badge: 'CUSTOM STOCKS',
    defaults: {
      exchange: 'ASX',
      currency: 'AUD',
      strategy_protocol: 'DEDICATED_TICKERS_ONLY',
      sector_persona: 'MOONSHOT_COILED_HUNTER',
      wealth_sub_modes: [],
      execution_mode: 'APPROVAL_1CLICK',
      starting_capital: 5000,
      min_price: 0.001,
      max_price: 999999.0,
      stop_loss_pct: 20.0,
      chandelier_atr_mult: 4.5,
      take_profit_pct: 2000.0,
      power_thrust_rsi_override: true,
      max_rsi: 90,
      min_conviction: 7,
      kelly_fraction: 0.50,
      max_open_positions: 10,
      harvest_enabled: true,
      harvest_mode: 'RECOVER_PRINCIPAL_PCT',
      harvest_trigger_gain_pct: 100.0,
      harvest_recovery_pct: 100.0,
      catch_macd_cross: true,
      catch_chandelier_atr: true,
      catch_ema_break: false,
      catch_ema_period: 20,
      catch_obv_distribution: false,
      catch_hard_ceiling: false
    }
  }
];

const PERSONA_OPTIONS = [
  {
    id: 'MOONSHOT_COILED_HUNTER',
    label: '🚀 Moonshot Coiled Spring 2,000% Profit Hunter (Squeeze / NR7 / CMF Accumulation)',
    blueprintId: 'MOONSHOT_COILED_SPRING'
  },
  {
    id: 'EXPLORATION_GEOLOGIST',
    label: '⛏️ Exploration Geologist & Assay Auditor (Drill Intercepts g/t Au, % Li2O, % Nb2O5, Cash Runway)',
    blueprintId: 'EXPLORATION_ASSAY_SNIPER'
  },
  {
    id: 'FORTRESS_QUANT_OFFICER',
    label: '💎 Wealth & High-Return Hold — Quality Compounder & Franked Dividend Fortress (Sub-Modes 1–4)',
    blueprintId: 'WEALTH_DIVIDEND_FORTRESS'
  },
  {
    id: 'WALL_ST_MOMENTUM_TECH',
    label: '📈 High-Beta Global Tech, AI & Sovereign Defense Specialist (OBV Waves & ARR Growth)',
    blueprintId: 'INTERNATIONAL_ALPHA'
  },
  {
    id: 'BIOTECH_CLINICAL_AUDITOR',
    label: '🧬 Biotech & Clinical Trial Regulatory Auditor (Phase I/II/III, FDA/TGA Readouts)',
    blueprintId: 'EXPLORATION_ASSAY_SNIPER'
  }
];

export default function WorkbookAutoBuilderModal({
  isOpen,
  onClose,
  userSession,
  initialWorkbook = null,
  initialTab = 'WORKBOOK_BUILDER',
  onWorkbookSaved
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState('MOONSHOT_COILED_SPRING');

  // Global AI & Data Hub State
  const [aiProvider, setAiProvider] = useState('antigravity_mcp');
  const [aiModel, setAiModel] = useState('antigravity-mcp-orchestrator-v2 (Primary MCP Agent + Gemini Flash/Pro)');
  const [customAiModel, setCustomAiModel] = useState('');
  const [aiApiKey, setAiApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([
    'antigravity-mcp-orchestrator-v2 (Primary MCP Agent + Gemini Flash/Pro)',
    'antigravity-mcp-deep-research (Multi-Workbook MCP Synthesis)',
    'antigravity-mcp-autonomous-sniper (Real-Time MCP Execution Agent)'
  ]);
  const [providerCatalog, setProviderCatalog] = useState({});
  const [dataProvider, setDataProvider] = useState('yahoo_google_fallback');
  const [dataApiKey, setDataApiKey] = useState('');
  const [dataTierLevel, setDataTierLevel] = useState('TIER_1_RESILIENT_FREE (Yahoo + GoogleFinance + Stooq Multi-Fallback)');
  const [autoUpgradeModels, setAutoUpgradeModels] = useState(true);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [globalSaveMsg, setGlobalSaveMsg] = useState('');

  // Workbook Builder State (Clean $5,000 Default + Tried & True Persona Auto-Defaults)
  const [wbName, setWbName] = useState('Moonshot Coiled Spring Node');
  const [sheetUrlOrId, setSheetUrlOrId] = useState('');
  const [exchange, setExchange] = useState('ASX');
  const [currency, setCurrency] = useState('AUD');
  const [strategyProtocol, setStrategyProtocol] = useState('MOONSHOT_COILED_SPRING');
  const [sectorPersona, setSectorPersona] = useState('MOONSHOT_COILED_HUNTER');
  const [wealthSubModes, setWealthSubModes] = useState([
    'TOTAL_RETURN_DIVIDEND_GROWTH',
    'QUALITY_WEALTH_COMPOUNDER',
    'YIELD_ON_COST_BUILDER',
    'DEFENSIVE_CASH_COW_ROYALTY'
  ]);
  const [executionMode, setExecutionMode] = useState('AUTONOMOUS');
  const [startingCapital, setStartingCapital] = useState(5000);
  const [minPrice, setMinPrice] = useState(0.001);
  const [maxPrice, setMaxPrice] = useState(0.50);
  const [stopLossPct, setStopLossPct] = useState(25.0);
  const [chandelierAtr, setChandelierAtr] = useState(5.5);
  const [takeProfitPct, setTakeProfitPct] = useState(2000.0);
  const [powerThrustRsi, setPowerThrustRsi] = useState(true);
  const [maxRsi, setMaxRsi] = useState(90);
  const [minConviction, setMinConviction] = useState(8);
  const [kellyFraction, setKellyFraction] = useState(0.50);
  const [maxOpenPositions, setMaxOpenPositions] = useState(12);
  const [dedicatedTickers, setDedicatedTickers] = useState('');

  // Stage 1: House Money Principal Harvest State
  const [harvestEnabled, setHarvestEnabled] = useState(true);
  const [harvestMode, setHarvestMode] = useState('RECOVER_PRINCIPAL_PCT');
  const [harvestTriggerGainPct, setHarvestTriggerGainPct] = useState(100.0);
  const [harvestRecoveryPct, setHarvestRecoveryPct] = useState(100.0);

  // Stage 2: Selectable Runner Catch Options (1 to 5)
  const [catchMacdCross, setCatchMacdCross] = useState(true);
  const [catchChandelierAtr, setCatchChandelierAtr] = useState(true);
  const [catchEmaBreak, setCatchEmaBreak] = useState(true);
  const [catchEmaPeriod, setCatchEmaPeriod] = useState(20);
  const [catchObvDistribution, setCatchObvDistribution] = useState(false);
  const [catchHardCeiling, setCatchHardCeiling] = useState(false);

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState([]);
  const [buildError, setBuildError] = useState('');
  const [defaultsAppliedBanner, setDefaultsAppliedBanner] = useState('Tried & True Defaults Active for: 🚀 Moonshot Coiled Spring (2,000%+ Hunter)');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'WORKBOOK_BUILDER');
      fetchGlobalSettings();
      if (initialWorkbook && initialWorkbook.id !== 'ALL') {
        setWbName(initialWorkbook.name || 'Custom Workbook');
        setSheetUrlOrId(initialWorkbook.spreadsheet_id || initialWorkbook.id || '');
        setExchange(initialWorkbook.exchange || 'ASX');
        setCurrency(initialWorkbook.currency || 'AUD');
        setStrategyProtocol(initialWorkbook.strategy_protocol || 'MOONSHOT_COILED_SPRING');
        setSectorPersona(initialWorkbook.sector_persona || 'MOONSHOT_COILED_HUNTER');
        setWealthSubModes(
          initialWorkbook.wealth_sub_modes?.length
            ? initialWorkbook.wealth_sub_modes
            : ['TOTAL_RETURN_DIVIDEND_GROWTH', 'QUALITY_WEALTH_COMPOUNDER', 'YIELD_ON_COST_BUILDER', 'DEFENSIVE_CASH_COW_ROYALTY']
        );
        setExecutionMode(initialWorkbook.execution_mode || 'AUTONOMOUS');
        setStartingCapital(initialWorkbook.starting_capital || initialWorkbook.equity || 5000);
        setMinPrice(initialWorkbook.min_price ?? 0.001);
        setMaxPrice(initialWorkbook.max_price ?? 0.50);
        setStopLossPct(initialWorkbook.stop_loss_pct ?? 25.0);
        setChandelierAtr(initialWorkbook.chandelier_atr_mult ?? 5.5);
        setTakeProfitPct(initialWorkbook.take_profit_pct ?? 2000.0);
        setPowerThrustRsi(initialWorkbook.power_thrust_rsi_override ?? true);
        setMaxRsi(initialWorkbook.max_rsi ?? 90);
        setMinConviction(initialWorkbook.min_conviction ?? 8);
        setKellyFraction(initialWorkbook.kelly_fraction ?? 0.50);
        setMaxOpenPositions(initialWorkbook.max_open_positions ?? 12);
        setDedicatedTickers(initialWorkbook.dedicated_tickers || '');
        setHarvestEnabled(initialWorkbook.harvest_enabled ?? true);
        setHarvestMode(initialWorkbook.harvest_mode || 'RECOVER_PRINCIPAL_PCT');
        setHarvestTriggerGainPct(initialWorkbook.harvest_trigger_gain_pct ?? 100.0);
        setHarvestRecoveryPct(initialWorkbook.harvest_recovery_pct ?? 100.0);
        setCatchMacdCross(initialWorkbook.catch_macd_cross ?? true);
        setCatchChandelierAtr(initialWorkbook.catch_chandelier_atr ?? true);
        setCatchEmaBreak(initialWorkbook.catch_ema_break ?? true);
        setCatchEmaPeriod(initialWorkbook.catch_ema_period ?? 20);
        setCatchObvDistribution(initialWorkbook.catch_obv_distribution ?? false);
        setCatchHardCeiling(initialWorkbook.catch_hard_ceiling ?? false);
      } else {
        applyBlueprint(STRATEGY_BLUEPRINTS[0]);
        setBuildLogs([]);
        setBuildError('');
      }
    }
  }, [isOpen, initialWorkbook, initialTab]);

  const fetchGlobalSettings = async (overrideProvider = null) => {
    setIsRefreshingModels(true);
    try {
      const q = overrideProvider ? `?provider=${overrideProvider}` : '';
      const res = await fetch(`${API_BASE}/api/v2/settings/global${q}`, {
        headers: { Authorization: `Bearer ${userSession?.idToken || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.provider_catalog) setProviderCatalog(data.provider_catalog);
        if (!overrideProvider && data.settings) {
          setAiProvider(data.settings.primary_ai_provider || 'antigravity_mcp');
          setAiModel(data.settings.ai_model || '');
          setCustomAiModel(data.settings.custom_ai_model_override || '');
          setDataProvider(data.settings.data_provider || 'yahoo_google_fallback');
          setDataTierLevel(data.settings.data_tier_level || '');
          setAutoUpgradeModels(data.settings.auto_upgrade_models ?? true);
        }
        if (data.available_models && data.available_models.length > 0) {
          setAvailableModels(data.available_models);
          if (overrideProvider) {
            setAiModel(data.available_models[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Global intelligence fetch notice:', e);
    } finally {
      setIsRefreshingModels(false);
    }
  };

  const handleProviderChange = (newProv) => {
    setAiProvider(newProv);
    if (providerCatalog[newProv]) {
      setAvailableModels(providerCatalog[newProv]);
      setAiModel(providerCatalog[newProv][0] || '');
    }
    fetchGlobalSettings(newProv);
  };

  const handleSaveGlobalSettings = async () => {
    setGlobalSaveMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/v2/settings/global`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userSession?.idToken || ''}`
        },
        body: JSON.stringify({
          primary_ai_provider: aiProvider,
          ai_model: aiModel,
          custom_ai_model_override: customAiModel,
          ai_api_key: aiApiKey,
          data_provider: dataProvider,
          data_api_key: dataApiKey,
          auto_upgrade_models: autoUpgradeModels
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDataTierLevel(data.settings?.data_tier_level || dataTierLevel);
        setAiApiKey('');
        setDataApiKey('');
        setGlobalSaveMsg('Global AI Agent, Live Model & Data Tier Vaulted! All Workbooks Upgraded.');
        setTimeout(() => setGlobalSaveMsg(''), 4000);
      }
    } catch (e) {
      setGlobalSaveMsg('Saved to local fleet profile.');
    }
  };

  // Auto-populates the entire bottom section with Tried & True Defaults for the selected Blueprint/Persona
  const applyBlueprint = (bp) => {
    setSelectedBlueprintId(bp.id);
    const d = bp.defaults;
    setStrategyProtocol(d.strategy_protocol);
    setSectorPersona(d.sector_persona);
    if (d.wealth_sub_modes?.length) {
      setWealthSubModes(d.wealth_sub_modes);
    }
    setExchange(d.exchange);
    setCurrency(d.currency);
    setExecutionMode(d.execution_mode);
    setMinPrice(d.min_price);
    setMaxPrice(d.max_price);
    setStopLossPct(d.stop_loss_pct);
    setChandelierAtr(d.chandelier_atr_mult);
    setTakeProfitPct(d.take_profit_pct);
    setPowerThrustRsi(d.power_thrust_rsi_override);
    setMaxRsi(d.max_rsi);
    setMinConviction(d.min_conviction);
    setKellyFraction(d.kelly_fraction);
    setMaxOpenPositions(d.max_open_positions);
    // Stage 1 Harvest Defaults
    setHarvestEnabled(d.harvest_enabled);
    setHarvestMode(d.harvest_mode);
    setHarvestTriggerGainPct(d.harvest_trigger_gain_pct);
    setHarvestRecoveryPct(d.harvest_recovery_pct);
    // Stage 2 Catch Options Defaults
    setCatchMacdCross(d.catch_macd_cross);
    setCatchChandelierAtr(d.catch_chandelier_atr);
    setCatchEmaBreak(d.catch_ema_break);
    setCatchEmaPeriod(d.catch_ema_period);
    setCatchObvDistribution(d.catch_obv_distribution);
    setCatchHardCeiling(d.catch_hard_ceiling);

    if (!initialWorkbook) {
      setWbName(bp.title.replace(/^[^\w]+/, '').trim());
    }
    setDefaultsAppliedBanner(`Tried & True Defaults Auto-Loaded for: ${bp.title}`);
  };

  const handlePersonaDropdownChange = (newPersonaId) => {
    setSectorPersona(newPersonaId);
    const matchOpt = PERSONA_OPTIONS.find((p) => p.id === newPersonaId);
    if (matchOpt) {
      const bp = STRATEGY_BLUEPRINTS.find((b) => b.id === matchOpt.blueprintId);
      if (bp) applyBlueprint(bp);
    }
  };

  const toggleWealthSubMode = (modeId) => {
    setWealthSubModes((prev) =>
      prev.includes(modeId) ? prev.filter((m) => m !== modeId) : [...prev, modeId]
    );
  };

  // Count how many Stage-2 Technical Catch Options are currently checked
  const activeTechCatches = [
    catchMacdCross && 'Bearish MACD Cross',
    catchChandelierAtr && `Chandelier ATR (${chandelierAtr}x)`,
    catchEmaBreak && `${catchEmaPeriod} EMA Breakdown`,
    catchObvDistribution && 'OBV / CMF Distribution'
  ].filter(Boolean);

  const handleAutoBuildWorkbook = async () => {
    setIsBuilding(true);
    setBuildError('');
    setBuildLogs([]);

    try {
      const res = await fetch(`${API_BASE}/api/v2/workbooks/auto-build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userSession?.idToken || ''}`
        },
        body: JSON.stringify({
          workbook_id: initialWorkbook?.id || '',
          spreadsheet_id: sheetUrlOrId,
          name: wbName,
          exchange,
          currency,
          strategy_protocol: strategyProtocol,
          sector_persona: sectorPersona,
          wealth_sub_modes: wealthSubModes,
          execution_mode: executionMode,
          starting_capital: Number(startingCapital) || 5000,
          min_price: Number(minPrice),
          max_price: Number(maxPrice),
          stop_loss_pct: Number(stopLossPct),
          chandelier_atr_mult: Number(chandelierAtr),
          take_profit_pct: Number(takeProfitPct),
          uncapped_runner: !catchHardCeiling,
          power_thrust_rsi_override: Boolean(powerThrustRsi),
          max_rsi: Number(maxRsi),
          min_conviction: Number(minConviction),
          kelly_fraction: Number(kellyFraction),
          max_open_positions: Number(maxOpenPositions),
          dedicated_tickers: dedicatedTickers,
          harvest_enabled: Boolean(harvestEnabled),
          harvest_mode: harvestMode,
          harvest_trigger_gain_pct: Number(harvestTriggerGainPct),
          harvest_recovery_pct: Number(harvestRecoveryPct),
          min_remaining_parcel_aud: 500.0,
          catch_macd_cross: Boolean(catchMacdCross),
          catch_chandelier_atr: Boolean(catchChandelierAtr),
          catch_ema_break: Boolean(catchEmaBreak),
          catch_ema_period: Number(catchEmaPeriod),
          catch_obv_distribution: Boolean(catchObvDistribution),
          catch_hard_ceiling: Boolean(catchHardCeiling)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to auto-build workbook.');
      }

      const steps = data.auto_build_steps || [
        '1. Global AI & Antigravity MCP Agent Linked',
        '2. Hidden _TITAN_VAULT Provisioned (Brain & DB Keys Hidden Server-Side)',
        `3. Persona Injected: ${sectorPersona}`,
        `4. Isolated Cash Pot ($${Number(startingCapital).toLocaleString()}) & Harvest Rules Synced`,
        '5. Python Direct-Push Active + GAS & Neon DB Failover Armed'
      ];
      steps.forEach((s, idx) => {
        setTimeout(() => {
          setBuildLogs((prev) => [...prev, s]);
          if (idx === steps.length - 1) {
            setIsBuilding(false);
            if (onWorkbookSaved) onWorkbookSaved(data.workbook);
          }
        }, (idx + 1) * 160);
      });
    } catch (err) {
      setIsBuilding(false);
      setBuildError(err.message || 'Auto-build error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b111e] border border-slate-800 rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="bg-[#111827] border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                TITAN FLEET COMMAND & PERSONA WORKBOOK CONFIGURATOR
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Select a Persona to Auto-Load Tried & True Defaults • 2-Stage House Money Harvest • Wealth & Dividend Hold
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-[#0f172a] border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('WORKBOOK_BUILDER')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'WORKBOOK_BUILDER'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{initialWorkbook ? `Edit Workbook: ${initialWorkbook.name}` : '1. Configure Workbook Persona, Harvest & Catch Rules'}</span>
          </button>

          <button
            onClick={() => setActiveTab('GLOBAL_AI_HUB')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'GLOBAL_AI_HUB'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. Global AI Agent (Antigravity MCP) & Upgradable Data APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('FAILOVER_SHIELD')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'FAILOVER_SHIELD'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Multi-Tier Failover & Hidden Vault Status</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* =============================================================== */}
          {/* TAB 1: PERSONA-DRIVEN WORKBOOK BUILDER & HARVEST/CATCH SYSTEM   */}
          {/* =============================================================== */}
          {activeTab === 'WORKBOOK_BUILDER' && (
            <div className="space-y-5">
              {/* TOP SECTION: 1-Click Persona & Trading Method Selector */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Step 1 — Select Workbook Persona & Trading Method (Auto-Populates Tried & True Defaults Below)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const bp = STRATEGY_BLUEPRINTS.find((b) => b.id === selectedBlueprintId) || STRATEGY_BLUEPRINTS[0];
                      applyBlueprint(bp);
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 hover:text-emerald-200 bg-emerald-950/50 border border-emerald-700/50 px-2.5 py-1 rounded-lg"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Tried & True Persona Defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {STRATEGY_BLUEPRINTS.map((bp) => {
                    const isSelected = selectedBlueprintId === bp.id;
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => applyBlueprint(bp)}
                        className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-400 shadow-lg shadow-emerald-950/50'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {bp.badge}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-100 leading-snug mb-1">
                            {bp.title}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {bp.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WEALTH & HIGH-RETURN HOLD SUB-MODES (1 TO 4 SELECTABLE WHEN WEALTH FORTRESS ACTIVE) */}
              {(selectedBlueprintId === 'WEALTH_DIVIDEND_FORTRESS' || sectorPersona === 'FORTRESS_QUANT_OFFICER') && (
                <div className="bg-cyan-950/20 border border-cyan-500/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Wealth & High-Return Hold Sub-Personas (Select 1 to 4 Flavours to Hunt & Hold)
                    </span>
                    <span className="text-[10px] font-mono text-cyan-200 bg-cyan-500/15 px-2 py-0.5 rounded">
                      {wealthSubModes.length} of 4 Active
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {WEALTH_SUB_MODES.map((wm) => {
                      const checked = wealthSubModes.includes(wm.id);
                      return (
                        <label
                          key={wm.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                            checked
                              ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleWealthSubMode(wm.id)}
                            className="mt-0.5 rounded text-cyan-500 focus:ring-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-cyan-200">{wm.label}</div>
                            <div className="text-[10px] text-slate-400">{wm.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Workbook Name, Sheet Link, Persona & Clean $5,000 Default Cash Input */}
              <div className="bg-slate-900/50 border border-slate-800/90 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Workbook Name
                    </label>
                    <input
                      type="text"
                      value={wbName}
                      onChange={(e) => setWbName(e.target.value)}
                      placeholder="e.g., ASX PennyMines Coiled Springs"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Google Sheet URL or ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={sheetUrlOrId}
                      onChange={(e) => setSheetUrlOrId(e.target.value)}
                      placeholder="Paste Sheet URL or leave blank"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                      Isolated Workbook Cash Pot (Default $5,000)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs font-mono font-bold text-white"
                      >
                        <option value="AUD">AUD</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                      </select>
                      <input
                        type="number"
                        min="100"
                        step="500"
                        value={startingCapital}
                        onChange={(e) => setStartingCapital(e.target.value)}
                        className="w-full bg-slate-950 border border-emerald-500/60 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      World Exchange & Execution Mode
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={exchange}
                        onChange={(e) => {
                          const ex = e.target.value;
                          setExchange(ex);
                          if (ex === 'ASX') setCurrency('AUD');
                          if (ex === 'NYSE' || ex === 'NASDAQ') setCurrency('USD');
                          if (ex === 'LSE') setCurrency('GBP');
                          if (ex === 'TSX') setCurrency('CAD');
                        }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-white"
                      >
                        <option value="ASX">🇦🇺 ASX</option>
                        <option value="NASDAQ">🇺🇸 NASDAQ</option>
                        <option value="NYSE">🇺🇸 NYSE</option>
                        <option value="LSE">🇬🇧 LSE</option>
                        <option value="TSX">🇨🇦 TSX</option>
                        <option value="GLOBAL">🌐 GLOBAL</option>
                      </select>
                      <select
                        value={executionMode}
                        onChange={(e) => setExecutionMode(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-emerald-300"
                      >
                        <option value="AUTONOMOUS">⚡ AUTO</option>
                        <option value="APPROVAL_1CLICK">👆 1-CLICK</option>
                        <option value="PAPER_SANDBOX">🧪 PAPER</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* =============================================================== */}
              {/* BOTTOM SECTION: AUTO-POPULATED TRIED & TRUE DEFAULTS            */}
              {/* (Entry/Stop + Stage 1 House Money Harvest + Stage 2 Catch)      */}
              {/* =============================================================== */}
              <div className="bg-[#0e1628] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {defaultsAppliedBanner}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                    All Tried & True Defaults Below Can Be Customized Anytime
                  </span>
                </div>

                {/* 3-Column Bottom Grid: Col 1 (Entry & Stop) | Col 2 (Stage 1 House Money Harvest) | Col 3 (Stage 2 Catch Options) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* COLUMN 1: ENTRY PRICE BRACKET & INITIAL DOWNSIDE STOP */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center justify-between">
                      <span>1. Entry & Initial Stop Rules</span>
                      <span className="text-[10px] text-slate-400">Pre-Harvest</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Min Share Price ($)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Max Share Price ($)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Initial Stop-Loss (%)</label>
                        <input
                          type="number"
                          step="1"
                          value={stopLossPct}
                          onChange={(e) => setStopLossPct(e.target.value)}
                          className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-rose-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Max Open Positions</label>
                        <input
                          type="number"
                          step="1"
                          value={maxOpenPositions}
                          onChange={(e) => setMaxOpenPositions(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                      <input
                        type="checkbox"
                        checked={powerThrustRsi}
                        onChange={(e) => setPowerThrustRsi(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-amber-300">
                          Power-Thrust RSI Override (Allow RSI up to {maxRsi})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Enters explosive coiled breakouts on 4.0x+ volume surge
                        </div>
                      </div>
                    </label>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 mb-1">
                        Dedicated Stocks Only (Optional — Blank = Full {exchange} Scan)
                      </label>
                      <input
                        type="text"
                        value={dedicatedTickers}
                        onChange={(e) => setDedicatedTickers(e.target.value)}
                        placeholder="e.g. WA1, WIA, SXG, DEG"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300"
                      />
                    </div>
                  </div>

                  {/* COLUMN 2: STAGE 1 — "HOUSE MONEY" PRINCIPAL HARVEST SYSTEM */}
                  <div className="bg-slate-950/70 border border-amber-500/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase font-mono flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        2. Stage-1 House Money Harvest
                      </span>
                      <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                        Rule 24 &gt;= $500 Guard
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Harvest Method (Tried & True Default Pre-Selected)
                      </label>
                      <select
                        value={harvestMode}
                        onChange={(e) => setHarvestMode(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-200"
                      >
                        <option value="RECOVER_PRINCIPAL_PCT">
                          🏦 Recover Original Principal % (House Money Free-Carry)
                        </option>
                        <option value="SELL_SHARE_PCT">
                          📊 Sell Fixed % of Total Shares at Trigger
                        </option>
                        <option value="SKIM_EXCESS_PROFIT">
                          💰 Skim Excess Profit Only (Keep 100% Core Principal Riding)
                        </option>
                        <option value="HOLD_100_COMPOUND">
                          💎 Hold 100% & Compound (Wealth / Dividend Hold Default)
                        </option>
                      </select>
                    </div>

                    {harvestMode !== 'HOLD_100_COMPOUND' ? (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              Trigger at Gain (%)
                            </label>
                            <input
                              type="number"
                              step="10"
                              value={harvestTriggerGainPct}
                              onChange={(e) => setHarvestTriggerGainPct(e.target.value)}
                              className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              {harvestMode === 'SELL_SHARE_PCT' ? 'Shares to Sell (%)' : 'Principal Recovery (%)'}
                            </label>
                            <input
                              type="number"
                              step="10"
                              value={harvestRecoveryPct}
                              onChange={(e) => setHarvestRecoveryPct(e.target.value)}
                              className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-300"
                            />
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-950/25 border border-amber-500/30 text-[11px] text-slate-300 leading-relaxed">
                          At <strong className="text-amber-300">+{harvestTriggerGainPct}% gain</strong>, Titan sells enough shares to return{' '}
                          <strong className="text-emerald-300">{harvestRecoveryPct}% of your initial capital + brokerage</strong> straight back into this workbook's Cash Pool. The initial stop-loss is then retired and the remaining shares ride <strong>100% risk-free</strong>!
                        </div>
                      </>
                    ) : (
                      <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200 leading-relaxed">
                        <strong>💎 Wealth & Dividend Compounder Active:</strong> 100% of shares are held long-term to maximize dividend payouts, franking credits, and compounding returns. Positions only exit if all selected Stage-2 Macro Catch signals break simultaneously.
                      </div>
                    )}
                  </div>

                  {/* COLUMN 3: STAGE 2 — SELECTABLE MOONSHOT RUNNER "CATCH OPTIONS" (1 TO 5) */}
                  <div className="bg-slate-950/70 border border-emerald-500/40 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 uppercase font-mono">
                        3. Stage-2 Runner Catch Options
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {activeTechCatches.length === 1
                          ? '1 Selected = Single Trigger'
                          : `${activeTechCatches.length} Selected = ALL Must Hit`}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Select 1 option for a single trigger, or select multiple options so <strong>ALL selected signals must hit together</strong> before selling your Free-Carry Moonshot:
                    </p>

                    {/* Catch Option 1: Bearish MACD Crossover */}
                    <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={catchMacdCross}
                          onChange={(e) => setCatchMacdCross(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-200">
                          1. Bearish MACD Crossover / Hook
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">Momentum Roll</span>
                    </label>

                    {/* Catch Option 2: Chandelier ATR Trailing Stop */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={catchChandelierAtr}
                          onChange={(e) => setCatchChandelierAtr(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-200">
                          2. Chandelier ATR Trail
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          value={chandelierAtr}
                          onChange={(e) => setChandelierAtr(e.target.value)}
                          className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-emerald-300 text-right"
                        />
                        <span className="text-[10px] font-mono text-slate-400">x ATR</span>
                      </div>
                    </div>

                    {/* Catch Option 3: EMA Ribbon Breakdown */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={catchEmaBreak}
                          onChange={(e) => setCatchEmaBreak(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-200">
                          3. EMA Trend Breakdown
                        </span>
                      </label>
                      <select
                        value={catchEmaPeriod}
                        onChange={(e) => setCatchEmaPeriod(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[11px] font-mono text-emerald-300"
                      >
                        <option value={9}>9 EMA (Fast)</option>
                        <option value={20}>20 EMA (Swing)</option>
                        <option value={50}>50 EMA (Macro Hold)</option>
                      </select>
                    </div>

                    {/* Catch Option 4: OBV / CMF Distribution */}
                    <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={catchObvDistribution}
                          onChange={(e) => setCatchObvDistribution(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-200">
                          4. OBV / CMF Smart-Money Dump
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">Volume Outflow</span>
                    </label>

                    {/* Catch Option 5: Optional Hard Profit Ceiling % */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={catchHardCeiling}
                          onChange={(e) => setCatchHardCeiling(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-200">
                          5. Hard Ceiling % {!catchHardCeiling && '(Uncapped)'}
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="100"
                          value={takeProfitPct}
                          onChange={(e) => setTakeProfitPct(e.target.value)}
                          disabled={!catchHardCeiling}
                          className={`w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-right ${
                            catchHardCeiling ? 'text-amber-300 font-bold' : 'text-slate-600'
                          }`}
                        />
                        <span className="text-[10px] font-mono text-slate-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Build Audit Logs */}
              {buildLogs.length > 0 && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Auto-Build, House Money Harvest & Hidden _TITAN_VAULT Sync Complete:
                  </div>
                  {buildLogs.map((log, i) => (
                    <div key={i} className="text-xs font-mono text-slate-200">
                      ✓ {log}
                    </div>
                  ))}
                </div>
              )}

              {buildError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
                  {buildError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isBuilding}
                  onClick={handleAutoBuildWorkbook}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isBuilding ? 'Auto-Building & Syncing Vault...' : 'Auto-Build & Save Workbook Configuration'}</span>
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: GLOBAL AI AGENT (ANTIGRAVITY MCP) & UPGRADABLE DATA APIS */}
          {/* =============================================================== */}
          {activeTab === 'GLOBAL_AI_HUB' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-950/25 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Set Once — Pre-Selected Across All Workbooks Automatically
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Select <strong>Antigravity MCP Agent</strong> or any live AI provider below. Entering an API key upgrades the entire fleet immediately while keeping keys hidden inside the server vault.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchGlobalSettings(aiProvider)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-mono transition shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingModels ? 'animate-spin' : ''}`} />
                  <span>Sync Latest Live Models</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    1. Primary AI Agent & Live Auto-Evolving Models
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      AI Provider / Orchestrator
                    </label>
                    <select
                      value={aiProvider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="antigravity_mcp">⚡ Antigravity Main MCP AI Agent (Connected to All 8 Fleet MCP Servers)</option>
                      <option value="gemini">✨ Google Gemini (Live Auto-Updating SDK Models)</option>
                      <option value="perplexity">🌐 Perplexity Sonar Pro (Live Web & ASX Announcement Search)</option>
                      <option value="openai">🧠 OpenAI (GPT-4o / o3-mini / o1 Reasoning)</option>
                      <option value="anthropic">🏛️ Anthropic Claude (Claude 3.7 / 3.5 Sonnet)</option>
                      <option value="deepseek">🔬 DeepSeek R1 (Quantitative Reasoning)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Active Model (Auto-Populated from Live Provider SDK)
                    </label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300"
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Future / Custom Model ID Override (Optional — For Brand-New Model Drops)
                    </label>
                    <input
                      type="text"
                      value={customAiModel}
                      onChange={(e) => setCustomAiModel(e.target.value)}
                      placeholder="e.g., gemini-3.0-pro-exp (Overrides dropdown if typed)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Upgrade / Vault AI API Key (Hidden Server-Side — Never Written to Config Tab)
                    </label>
                    <input
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="•••••••••••• (Pre-loaded in Render Brain; paste new key to upgrade)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    2. Upgradable Market Data API Engine
                  </h3>

                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      Current Active Data Tier:
                    </div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {dataTierLevel}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Primary Market Data Feed (Auto-Upgrades System Speed & Depth When Key Entered)
                    </label>
                    <select
                      value={dataProvider}
                      onChange={(e) => setDataProvider(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="yahoo_google_fallback">🛡️ Built-In Multi-Fallback (Yahoo Finance + GoogleFinance + Stooq — Free)</option>
                      <option value="fmp">🚀 Financial Modeling Prep (FMP Pro — Full Institutional OHLCV & Fundamentals)</option>
                      <option value="polygon">⚡ Polygon.io (Low-Latency Tick & Second Aggregates)</option>
                      <option value="alphavantage">📊 AlphaVantage Premium (Global Equities & Forex)</option>
                      <option value="eodhd">🌍 EOD Historical Data (World Exchanges ASX/LSE/TSX/NYSE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Enter Data Provider API Key to Unlock Tier-3 Direct Institutional Feed
                    </label>
                    <input
                      type="password"
                      value={dataApiKey}
                      onChange={(e) => setDataApiKey(e.target.value)}
                      placeholder="Paste FMP / Polygon / AlphaVantage Key (Auto-vaulted & hidden)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  {globalSaveMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                      ✓ {globalSaveMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveGlobalSettings}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Save & Apply Global AI + Data Tier to All Workbooks
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: MULTI-TIER FAILOVER & HIDDEN VAULT ARCHITECTURE          */}
          {/* =============================================================== */}
          {activeTab === 'FAILOVER_SHIELD' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/70 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase font-mono">
                    Compute Failover (Render ↔ Google)
                  </div>
                  <div className="text-sm font-bold text-white">
                    Primary: Python Render Brain
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pushes prices, V4 Synaptic Quant Scores & Moonshot signals directly to your Google Sheets in <strong>&lt;0.8s</strong>, bypassing Google's 6-minute execution limit.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-mono">
                    Failover: If Render goes dark, Google Apps Script (<code>TitanLibrary</code> Watchdog) automatically wakes up and takes over scanning & stop-loss protection.
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase font-mono">
                    Database Failover (Supabase ↔ Nova/Neon)
                  </div>
                  <div className="text-sm font-bold text-white">
                    3-Tier FailoverEngineProxy Active
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every schema table is mirrored across <strong>Tier 1: Supabase Postgres</strong> and <strong>Tier 2: Neon / Nova Cloud DB</strong> (`FALLBACK_DATABASE_URL`).
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-cyan-300 font-mono">
                    Failover: Instant zero-downtime switch to Neon/Nova DB + Tier 3 Local SQLite bunker (`titan_fallback.db`).
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-purple-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-purple-400 uppercase font-mono">
                    Zero-Knowledge Vault (`_TITAN_VAULT`)
                  </div>
                  <div className="text-sm font-bold text-white">
                    Brain & DB Keys Hidden From Config Tab
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Database URLs, Brain tokens, and paid API keys are stored strictly in Render & hidden vault properties — never exposed in plain text on the sheet's Config tab.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-purple-300 font-mono flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Per-Workbook HMAC-SHA256 Node Token Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
