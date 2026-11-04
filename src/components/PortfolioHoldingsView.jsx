import React, { useState } from 'react';
import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCw, ShieldCheck, DollarSign, PieChart, Activity, ChevronRight } from 'lucide-react';

const WORKBOOKS = [
  { id: 'all', name: 'Consolidated Fleet (All 8 Workbooks)', cash: 641507.85, equity: 651271.82, openVal: 9763.97, trades: 114, winRate: 58.2 },
  { id: 'pennymines', name: 'Penny Mines (Critical Minerals & Assays)', cash: 88400.00, equity: 94250.00, openVal: 5850.00, trades: 32, winRate: 62.5 },
  { id: 'ai_trader', name: 'AI Trader (Autonomous Signals)', cash: 125000.00, equity: 128450.00, openVal: 3450.00, trades: 41, winRate: 56.1 },
  { id: 'asx_100', name: 'ASX 100 (Bluechips & Fortress)', cash: 150000.00, equity: 150463.85, openVal: 463.85, trades: 14, winRate: 71.4 },
  { id: 'special_poi', name: 'Special POI Watchlist', cash: 95000.00, equity: 95000.00, openVal: 0.00, trades: 9, winRate: 66.7 },
  { id: 'titan_1', name: 'Titan Fleet 1 (Coiled Springs)', cash: 72000.00, equity: 72000.00, openVal: 0.00, trades: 18, winRate: 50.0 }
];

const SAMPLE_HOLDINGS = [
  { ticker: 'WA1', name: 'WA1 Resources Ltd', exchange: 'ASX', units: 1000, buyPrice: 13.80, currentPrice: 14.50, costBase: 13800.00, marketVal: 14500.00, pnl: 700.00, pnlPct: 5.07, stopLoss: 12.42, currency: 'AUD' },
  { ticker: 'WIA', name: 'Wia Gold Limited', exchange: 'ASX', units: 35000, buyPrice: 0.130, currentPrice: 0.145, costBase: 4550.00, marketVal: 5075.00, pnl: 525.00, pnlPct: 11.54, stopLoss: 0.117, currency: 'AUD' },
  { ticker: 'SXG', name: 'Southern Cross Gold', exchange: 'ASX', units: 1200, buyPrice: 2.95, currentPrice: 3.10, costBase: 3540.00, marketVal: 3720.00, pnl: 180.00, pnlPct: 5.08, stopLoss: 2.65, currency: 'AUD' }
];

export default function PortfolioHoldingsView({ onSelectTicker }) {
  const [activeWb, setActiveWb] = useState(WORKBOOKS[0]);
  const [holdings, setHoldings] = useState(SAMPLE_HOLDINGS);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls: Workbook Switcher */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Connected Workbook Fleet</span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                PostgreSQL RLS Secured
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any of your 8 registered Google Sheet nodes to inspect cash balances, holdings, and risk throttles.
            </p>
          </div>
        </div>

        {/* Workbook Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Active Node:</label>
          <select
            value={activeWb.id}
            onChange={(e) => {
              const selected = WORKBOOKS.find((w) => w.id === e.target.value) || WORKBOOKS[0];
              setActiveWb(selected);
            }}
            className="bg-[#0a0e17] border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
          >
            {WORKBOOKS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Balance Sheet KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-slate-500 text-[11px] block mb-1">TOTAL PORTFOLIO EQUITY</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-100">
            A${activeWb.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">Cash + Open Valuation</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-slate-500 text-[11px] block mb-1">AVAILABLE CASH POT</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400">
            A${activeWb.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Ready for staged buy orders</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-slate-500 text-[11px] block mb-1">OPEN HOLDINGS VALUATION</span>
          <span className="text-xl sm:text-2xl font-bold text-cyan-300">
            A${activeWb.openVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">{holdings.length} Active Positions</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-slate-500 text-[11px] block mb-1">PROVEN WIN RATE</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-400">
            {activeWb.winRate}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">{activeWb.trades} Verified Audit Trades</span>
        </div>
      </div>

      {/* Live Open Holdings Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#151d30]">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Active Portfolio Holdings ({activeWb.name})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Stop Loss: <strong className="text-amber-400">-10.0% Trailing</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0f172a] text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Asset / Ticker</th>
                <th className="p-3.5">Units</th>
                <th className="p-3.5">Entry Price</th>
                <th className="p-3.5">Live Price</th>
                <th className="p-3.5">Cost Base</th>
                <th className="p-3.5">Market Value</th>
                <th className="p-3.5">Unrealized P&L</th>
                <th className="p-3.5">Stop Loss Floor</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {holdings.map((h) => {
                const isPos = h.pnl >= 0;
                return (
                  <tr key={h.ticker} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100 text-sm">{h.ticker}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{h.name}</div>
                    </td>
                    <td className="p-3.5 text-slate-200">{h.units.toLocaleString()}</td>
                    <td className="p-3.5 text-slate-300">${h.buyPrice.toFixed(3)}</td>
                    <td className="p-3.5 font-bold text-slate-100">${h.currentPrice.toFixed(3)}</td>
                    <td className="p-3.5 text-slate-400">${h.costBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3.5 font-bold text-slate-200">${h.marketVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3.5 font-semibold">
                      <span className={`inline-flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPos ? '+' : ''}${h.pnl.toFixed(2)} ({isPos ? '+' : ''}{h.pnlPct}%)
                      </span>
                    </td>
                    <td className="p-3.5 text-amber-400 font-bold">${h.stopLoss.toFixed(3)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectTicker(h.ticker)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <span>Analyze</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
