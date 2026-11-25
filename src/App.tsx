import { SimulationsView } from './components/SimulationsView';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { SIDEBAR_TABS } from './config/sidebarTabs';
import { AgentDashboardView } from './components/AgentDashboardView';
import { SplashAuthGate } from './components/SplashAuthGate';
import { AgentDashboardData, TabId } from './types/dashboard';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'agent' | 'trainer' | 'admin';
  assigned_account: string;
  assigned_lob: 'voice' | 'chat' | 'email';
  cohort_stage: 'new_hire' | 'deployed_prod';
}

const SAMPLE_SPAVI_AGENT_DATA: AgentDashboardData = {
  accountName: 'SPAVI',
  lob: 'Voice',
  agentName: 'Agent Preview',
  cohortStage: 'New Hire',
  kpis: {
    assignedDrills: 6,
    completedSimulations: 3,
    totalAttempts: 4,
    activeModules: 2,
    passedScenarios: 2,
    needsRetake: 1,
    avgScorePercent: 84,
    passRatePercent: 67,
  },
  proficiencyTrend: [
    { label: 'Run 1', score: 72, target: 80 },
    { label: 'Run 2', score: 80, target: 80 },
    { label: 'Run 3', score: 88, target: 80 },
    { label: 'Run 4', score: 92, target: 80 },
  ],
  scenarioBreakdown: [
    { scenario: 'Order Status', completed: 2 },
    { scenario: 'Escalations', completed: 1 },
    { scenario: 'Billing/Refund', completed: 1 },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');

  const urlAccount = new URLSearchParams(window.location.search)
    .get('account')
    ?.toUpperCase();

  const loadSessionAndProfile = async () => {
    setAuthError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setIsAuthenticated(false);
      setProfile(null);
      setSessionChecked(true);
      return;
    }

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select(
        'id, email, full_name, role, assigned_account, assigned_lob, cohort_stage'
      )
      .eq('id', user.id)
      .single();

    if (error || !profileData) {
      setAuthError(
        'No profile record found for this account. Contact your trainer/admin.'
      );
      setIsAuthenticated(false);
      setSessionChecked(true);
      return;
    }

    if (
      urlAccount &&
      profileData.role === 'agent' &&
      profileData.assigned_account.toUpperCase() !== urlAccount
    ) {
      await supabase.auth.signOut();
      setAuthError(
        `These credentials are assigned to ${profileData.assigned_account}, not ${urlAccount}.`
      );
      setIsAuthenticated(false);
      setProfile(null);
      setSessionChecked(true);
      return;
    }

    setProfile(profileData as UserProfile);
    setIsAuthenticated(true);
    setSessionChecked(true);
  };

  useEffect(() => {
    loadSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSessionAndProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-indigo-100/70 to-slate-200 flex items-center justify-center text-sm text-slate-600">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,_rgba(148,163,184,0.35),_transparent_45%),radial-gradient(circle_at_85%_20%,_rgba(126,76,246,0.14),_transparent_45%),linear-gradient(135deg,_#e6ebf2_0%,_#f3f5f9_50%,_#dfe6f0_100%)]">
        {authError && (
          <div className="bg-rose-600/90 backdrop-blur-md text-white text-xs text-center py-2 px-4">
            {authError}
          </div>
        )}
        <SplashAuthGate
          accountHint={urlAccount ?? 'SPAVI'}
          onAuthenticated={loadSessionAndProfile}
        />
      </div>
    );
  }

  const formattedLob =
    profile.assigned_lob === 'chat'
      ? 'Chat'
      : profile.assigned_lob === 'email'
      ? 'Email'
      : 'Voice';

  const dashboardData: AgentDashboardData = {
    ...SAMPLE_SPAVI_AGENT_DATA,
    accountName: profile.assigned_account,
    lob: 'Voice',
    agentName: profile.full_name || profile.email,
    cohortStage:
      profile.cohort_stage === 'deployed_prod'
        ? 'Deployed to Production'
        : 'New Hire',
  };

  const visibleTabs = SIDEBAR_TABS.filter(
    (tab) => !tab.lobs || tab.lobs.includes(profile.assigned_lob)
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,_rgba(255,255,255,0.85),_transparent_40%),radial-gradient(circle_at_88%_18%,_rgba(126,76,246,0.12),_transparent_45%),radial-gradient(circle_at_50%_95%,_rgba(56,189,248,0.12),_transparent_45%),linear-gradient(135deg,_#dfe5ee_0%,_#eef2f7_52%,_#d7dfeb_100%)] text-slate-800 p-3 md:p-6">
      <div className="mx-auto max-w-[1440px] min-h-[calc(100vh-3rem)] rounded-[28px] border border-white/80 bg-white/45 backdrop-blur-2xl shadow-[0_24px_70px_rgba(15,23,42,0.10)] flex flex-col md:flex-row overflow-hidden">
        {/* Glass Left Sidebar */}
        <aside className="w-full md:w-60 bg-white/55 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/75 flex flex-col justify-between p-4 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-5 rounded-2xl bg-white/60 border border-white/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7e4cf6] via-purple-500 to-cyan-400 flex items-center justify-center text-xs font-extrabold text-white shadow-sm">
                gicf
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">
                  Testing Center
                </div>
                <div className="text-[11px] text-slate-500">
                  {profile.assigned_account} • {formattedLob}
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {visibleTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-white/90 text-slate-900 border border-white shadow-[0_6px_18px_rgba(15,23,42,0.06)]'
                        : 'text-slate-600 hover:bg-white/55 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-900/5 text-slate-700 border border-white/70">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 px-3 py-3 rounded-2xl bg-white/55 border border-white/80 space-y-2">
            <div className="text-[11px] font-medium text-slate-700 truncate">
              {profile.email}
            </div>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleSignOut}
                className="font-medium text-[#7e4cf6] hover:text-[#6334d9] transition"
              >
                Sign Out
              </button>
              <span className="text-[11px] text-slate-400">© 2026</span>
            </div>
          </div>
        </aside>

        {/* Main Glass Workspace */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="p-5 md:p-7 space-y-6">
            {/* Top Frosted Header Bar */}
            <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/60 backdrop-blur-xl px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 border border-white text-xs font-bold text-slate-700 shadow-2xs">
                  {(dashboardData.agentName || 'A').slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Welcome back, {dashboardData.agentName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {dashboardData.accountName} • {dashboardData.cohortStage}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Quick filter note..."
                  className="w-40 sm:w-52 rounded-full border border-white/85 bg-white/70 px-3.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#7e4cf6] focus:bg-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      activeTab === 'dashboard' ? 'simulations' : 'dashboard'
                    )
                  }
                  className="rounded-full border border-white/85 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-white transition shadow-2xs"
                >
                  {activeTab === 'dashboard' ? 'Simulations' : 'Dashboard'}
                </button>
              </div>
            </header>

            {activeTab === 'dashboard' && (
              <AgentDashboardView
                data={dashboardData}
                onQuickAction={(action) => {
                  if (action === 'open_simulation') setActiveTab('simulations');
                }}
              />
            )}

            {activeTab === 'simulations' && (
              <SimulationsView
                accountName={dashboardData.accountName}
                lob={formattedLob}
              />
            )}
          </div>

          {/* Bottom Frosted Dock / Quick Bar */}
          <footer className="px-5 md:px-7 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/60 backdrop-blur-xl px-4 py-2.5 text-xs text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/80 border border-white px-2.5 py-1 font-medium text-slate-800">
                  GICF Glass UI
                </span>
                <span className="rounded-full bg-purple-500/10 border border-purple-200/70 px-2.5 py-1 font-medium text-purple-900">
                  Self-Paced Practice
                </span>
                <span className="rounded-full bg-white/70 border border-white px-2.5 py-1 text-slate-600">
                  Zero-API Chat Ready
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('simulations')}
                className="rounded-full bg-[#7e4cf6]/90 px-3.5 py-1 font-semibold text-white hover:bg-[#6b3be0] transition"
              >
                Open Practice →
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
