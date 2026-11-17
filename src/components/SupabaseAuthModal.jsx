import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Database,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SupabaseAuthModal({ 
  isOpen = true, 
  onClose, 
  title = "Institutional Terminal Authentication",
  subtitle = "Log in with Supabase Auth to access encrypted algorithmic execution nodes."
}) {
  const { 
    signInWithPassword, 
    signUp, 
    resetPasswordForEmail, 
    isConfigured 
  } = useAuth();

  const [mode, setMode] = useState('SIGN_IN'); // 'SIGN_IN' | 'SIGN_UP' | 'FORGOT'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await signInWithPassword({ email: email.trim(), password });
        setSuccessMessage('Authentication successful! Initializing secure workspace...');
        if (onClose) setTimeout(onClose, 600);
      } else if (mode === 'SIGN_UP') {
        if (!email || !password) {
          throw new Error('Please provide email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const data = await signUp({ 
          email: email.trim(), 
          password, 
          fullName: fullName.trim() 
        });

        // Supabase might require email confirmation
        if (data?.user && !data?.session) {
          setSuccessMessage('Account created! Please check your inbox to confirm your email before signing in.');
        } else {
          setSuccessMessage('Account created and authenticated successfully!');
          if (onClose) setTimeout(onClose, 800);
        }
      } else if (mode === 'FORGOT') {
        if (!email) {
          throw new Error('Please enter your account email address.');
        }
        await resetPasswordForEmail(email.trim());
        setSuccessMessage('Password recovery link sent! Check your inbox for reset instructions.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b111e] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-b from-[#131d31] to-[#0b111e]">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SUPABASE AUTH ENGINE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>RLS Enforced</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>
        </div>

        {/* Configuration Warning if .env is missing */}
        {!isConfigured && (
          <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-200">Supabase API Keys Missing</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Add <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_URL</code> and <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-amber-200">.env</code> file.
              </p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('SIGN_IN'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'SIGN_IN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('SIGN_UP'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'SIGN_UP'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {mode === 'SIGN_UP' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name / Fleet Operator
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institutional-desk.com"
                className="w-full bg-[#070b12] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          {mode !== 'FORGOT' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'SIGN_IN' && (
                  <button
                    type="button"
                    onClick={() => { setMode('FORGOT'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'SIGN_UP' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'FORGOT' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => { setMode('SIGN_IN'); setErrorMessage(''); setSuccessMessage(''); }}
                className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !isConfigured}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Cryptographic Handshake...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {mode === 'SIGN_IN' && 'Sign In to Quant Terminal'}
                    {mode === 'SIGN_UP' && 'Create Sovereign Account'}
                    {mode === 'FORGOT' && 'Send Password Recovery Email'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2 font-mono">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Zero-Trust PostgreSQL Row-Level Security · Rule 19 Compliant</span>
        </div>
      </div>
    </div>
  );
}
