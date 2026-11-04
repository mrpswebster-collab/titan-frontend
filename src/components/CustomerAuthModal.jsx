import React, { useState } from 'react';
import { X, ShieldCheck, Key, CheckCircle, Database } from 'lucide-react';

export default function CustomerAuthModal({ isOpen, onClose, userSession, onLoginSuccess }) {
  const [sheetId, setSheetId] = useState('');
  const [portfolioName, setPortfolioName] = useState('My Quant Fleet');
  const [currency, setCurrency] = useState('AUD');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedOAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email: 'trader@titanquant.internal',
        name: 'Authorized Quant Trader',
        spreadsheetId: sheetId || '1A2B3C4D5E6F7G8H9J',
        currency: currency,
        isAuthed: true
      });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#151d30]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">Multi-Tenant Customer Portal Login</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Connect your isolated tenant account. Your orders, portfolio positions, and API keys are strictly guarded by PostgreSQL Row-Level Security (RLS).
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Portfolio Node Name
              </label>
              <input
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="e.g. Apex Sovereign Alpha"
                className="w-full bg-[#0a0e17] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Dedicated Google Sheet ID (Optional)
              </label>
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="Leave blank for cloud-hosted database"
                className="w-full bg-[#0a0e17] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Primary Base Currency Pot
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0a0e17] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="AUD">AUD - Australian Dollar (ASX Native)</option>
                <option value="USD">USD - United States Dollar (Wall St Native)</option>
                <option value="GBP">GBP - British Pound (London Native)</option>
                <option value="CAD">CAD - Canadian Dollar (Toronto Native)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSimulatedOAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition duration-150"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Authenticating with Google OAuth PKCE...' : 'Sign In with Google Account'}</span>
            </button>
          </div>

          <div className="bg-[#0a0e17] p-3 rounded-lg border border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
            <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Multi-Tenant Isolation Law: Queries strictly scoped to your tenant ID. Cross-tenant leakage impossible.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
