import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SplashAuthGateProps {
  accountHint: string;
  onAuthenticated: () => void | Promise<void>;
}

export function SplashAuthGate({
  accountHint,
  onAuthenticated,
}: SplashAuthGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    await onAuthenticated();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/70 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(14,10,36,0.10)] space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center text-sm font-extrabold text-white shadow-lg shadow-purple-500/30">
              gicf
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">
                GICF Testing Center
              </div>
              <div className="text-xs text-slate-500">
                Agent Simulation & Readiness Portal
              </div>
            </div>
          </div>

          <span className="rounded-full border border-purple-200/80 bg-purple-500/10 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-purple-900">
            {accountHint}
          </span>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/55 backdrop-blur-md p-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Sign in with your assigned GICF training credentials to access your{' '}
            <span className="font-semibold text-slate-800">{accountHint}</span>{' '}
            dashboard and interactive Voice, Chat, and Email practice drills.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-500/10 backdrop-blur-md px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Work / Training Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@gicf.com"
              className="w-full rounded-xl border border-white/85 bg-white/75 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#7e4cf6] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/85 bg-white/75 backdrop-blur-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#7e4cf6] focus:bg-white focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#7e4cf6]/95 py-2.5 text-sm font-semibold text-white hover:bg-[#6b3be0] disabled:opacity-60 shadow-lg shadow-[#7e4cf6]/25 transition"
          >
            {submitting ? 'Signing In...' : 'Sign In to Testing Center'}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          Need credential assistance? Contact your trainer or operations admin.
        </div>
      </div>
    </div>
  );
}
