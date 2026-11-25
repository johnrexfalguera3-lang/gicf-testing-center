import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SplashAuthGateProps {
  accountHint?: string;
  onAuthenticated: () => void;
}

export const SplashAuthGate: React.FC<SplashAuthGateProps> = ({
  accountHint,
  onAuthenticated,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    onAuthenticated();
  };

  return (
    <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-purple-100">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-sm mb-3">
            gicf
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            GICF Testing Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your assigned credentials
            {accountHint ? ` • ${accountHint.toUpperCase()}` : ''}
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@example.com"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#7e4cf6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your assigned password"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#7e4cf6]"
            />
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#7e4cf6] hover:bg-[#6c3ae5] disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
