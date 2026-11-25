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
      <div className="min-h-screen bg-[#b8c4d4] flex items-center justify-center text-sm text-slate-700">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,_rgba(255,255,255,0.55),_transparent_45%),radial-gradient(circle_at_85%_85%,_rgba(126,76,246,0.18),_transparent_50%),linear-gradient(145deg,_#b9c5d6_0%,_#cdd6e3_50%,_#aebbd0_100%)]">
        {authError && (
          <div className="bg-rose-600/90 text-white text-xs text-center py-2 px-4">
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_12%,_rgba(255,255,255,0.6),_transparent_45%),radial-gradient(circle_at_85%_20%,_rgba(126,76,246,0.16),_transparent_48%),linear-gradient(145deg,_#b8c4d4_0%,_#cad4e2_52%,_#a8b6ca_100%)] text-slate-800 p-3 md:p-6">
      <div className="mx-auto max-w-[1380px] min-h-[calc(100vh-3rem)] rounded-3xl border border-white/75 ring-1 ring-inset ring-white/50 bg-white/35 backdrop-blur-2xl shadow-[0_24px_60px_rgba(15,23,42,0.18)] flex flex-col md:flex-row overflow-hidden">
        {/* Glass Left Rail */}
        <aside className="w-full md:w-56 bg-white/45 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/65 flex flex-col justify-between p-3.5 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 px-2.5 py-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7e4cf6] to-sky-400 flex items-center justify-center text-[11px] font-extrabold text-white shadow-sm">
                G
              </div>
              <span className="font-bold text-sm text-slate-900">
                Testing Center
              </span>
            </div>

            <nav className="space-y-1">
              {visibleTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-white/80 text-slate-900 border border-white/90 shadow-xs'
                        : 'text-slate-700 hover:bg-white/45'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-700">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 pt-3 border-t border-white/60 space-y-1.5 text-[11px] text-slate-600">
            <div className="truncate font-medium text-slate-800">
              {profile.assigned_account} • {profile.email}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-semibold text-[#6b3be0] hover:underline"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Glass Stage */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="p-4 md:p-6 space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/75 ring-1 ring-inset ring-white/50 bg-white/50 backdrop-blur-xl px-4 py-2.5 shadow-xs">
              <div className="text-xs md:text-sm font-semibold text-slate-900">
                Welcome back, {dashboardData.agentName}
                <span className="ml-2 text-xs font-normal text-slate-600">
                  ({dashboardData.accountName} • {dashboardData.cohortStage})
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    activeTab === 'dashboard' ? 'simulations' : 'dashboard'
                  )
                }
                className="rounded-full border border-white/85 bg-white/75 px-3.5 py-1 text-xs font-semibold text-slate-800 hover:bg-white transition"
              >
                {activeTab === 'dashboard' ? 'Go to Simulations' : 'Back to Dashboard'}
              </button>
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

          <div className="px-4 md:px-6 pb-4">
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/75 bg-white/50 backdrop-blur-xl px-4 py-2 text-[11px] font-medium text-slate-700 shadow-xs">
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-slate-900">
                {dashboardData.accountName}
              </span>
              <span className="rounded-full bg-[#7e4cf6]/15 px-2.5 py-0.5 text-purple-950">
                {formattedLob} Mode
              </span>
              <span className="rounded-full bg-white/70 px-2.5 py-0.5">
                Interactive Chat Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
