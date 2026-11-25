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
      <div className="min-h-screen bg-[#f5f4fb] flex items-center justify-center text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div>
        {authError && (
          <div className="bg-rose-600 text-white text-xs text-center py-2 px-4">
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
    lob: formattedLob,
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
    <div className="min-h-screen flex bg-[#f5f4fb] text-slate-900">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#0e0a24] text-white flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 px-2.5 py-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center text-xs font-extrabold">
              gicf
            </div>
            <span className="font-bold text-sm tracking-wide">Testing Center</span>
          </div>

          <nav className="space-y-1">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#7e4cf6] text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/15">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-2.5 pt-4 border-t border-white/10 space-y-2">
          <div className="text-[11px] text-slate-300 truncate">
            {profile.assigned_account} • {profile.email}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-purple-300 hover:text-white transition"
          >
            Sign Out
          </button>
          <div className="text-[11px] text-slate-400">© 2026 GICF Training</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <AgentDashboardView
            data={dashboardData}
            onQuickAction={(action) => {
              if (action === 'open_simulations') setActiveTab('simulations');
            }}
          />
        )}

        {activeTab === 'simulations' && (
          <SimulationsView
            accountName={dashboardData.accountName}
            lob={dashboardData.lob}
          />
        )}
      </main>
    </div>
  );
}
