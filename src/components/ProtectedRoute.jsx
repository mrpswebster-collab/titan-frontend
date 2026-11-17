import React from 'react';
import { useAuth } from '../context/AuthContext';
import SupabaseAuthModal from './SupabaseAuthModal';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function ProtectedRoute({ 
  children, 
  fallback = null, 
  requiredRole = null 
}) {
  const { user, session, loading, isConfigured } = useAuth();

  // 1. Session verification / hydration state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="p-8 rounded-3xl bg-[#0b111e] border border-slate-800 shadow-2xl flex flex-col items-center max-w-sm w-full text-center space-y-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Verifying Cryptographic Session</h3>
            <p className="text-xs text-slate-400 mt-1">Authenticating JWT with Supabase Auth Engine...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: enforce protected gate
  if (!user || !session) {
    if (fallback) {
      return fallback;
    }
    return (
      <SupabaseAuthModal 
        isOpen={true} 
        title="Protected Quant Workspace"
        subtitle="Authentication is required to view live exchange order books, portfolio holdings, and execution models."
      />
    );
  }

  // 3. Optional Role-based access control (using app_metadata strictly, not user_metadata, per Supabase security rules)
  if (requiredRole) {
    const userRole = user.app_metadata?.role;
    if (userRole !== requiredRole) {
      return (
        <div className="min-h-screen bg-[#070b12] text-slate-100 flex items-center justify-center p-6">
          <div className="p-8 rounded-2xl bg-[#0b111e] border border-rose-500/30 shadow-2xl max-w-md w-full text-center space-y-3">
            <h3 className="text-base font-bold text-rose-300">Access Restricted</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account ({user.email}) does not possess the required <span className="font-mono text-amber-300">[{requiredRole}]</span> privilege in <code className="text-slate-300">app_metadata</code>.
            </p>
          </div>
        </div>
      );
    }
  }

  // 4. Authenticated: Render protected routes / children
  return <>{children}</>;
}
