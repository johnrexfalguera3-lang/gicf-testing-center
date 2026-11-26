import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SplashAuthGateProps {
  accountHint?: string;
  onAuthenticated: () => void | Promise<void>;
}

export const SplashAuthGate: React.FC<SplashAuthGateProps> = ({
  accountHint,
  onAuthenticated,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const normalizedAccount = accountHint?.trim().toUpperCase();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    await onAuthenticated();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 md:p-7 space-y-5 rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/gicf-logo.jpg"
              alt="GICF Logo"
              className="h-9 w-auto object-contain mix-blend-multiply shrink-0"
            />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                GICF Testing Center
              </h1>
              <p className="text-xs text-slate-600">
                Agent Simulation &amp; Readiness Portal
              </p>
            </div>
          </div>

          {normalizedAccount && (
            <span className="rounded-full bg-[#7e4cf6]/15 px-3 py-1 text-xs font-semibold text-[#6b3be0]">
              {normalizedAccount}
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-white/60 border border-white/80 p-3.5 text-xs text-slate-700 leading-relaxed">
          Sign in with your assigned GICF training credentials to access{' '}
          {normalizedAccount ? (
            <>
              your <strong className="font-semibold text-slate-900">{normalizedAccount}</strong>{' '}
              dashboard
            </>
          ) : (
            'your assigned account dashboard'
          )}{' '}
          and interactive Voice, Chat, and Email practice drills.
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs text-rose-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Work / Training Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@gicf.com"
              className="w-full rounded-xl border border-slate-300/90 bg-white/85 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7e4cf6]/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300/90 bg-white/85 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7e4cf6]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#7e4cf6] py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6b3be0] disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In to Testing Center'}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500">
          Need credential assistance? Contact your trainer or operations admin.
        </p>
      </div>
    </div>
  );
};