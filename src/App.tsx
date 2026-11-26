import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { SIDEBAR_TABS, UserRole } from './config/sidebarTabs';
import { getAccountDashboardPreset } from './data/accountPresets';
import { AgentDashboardView } from './components/AgentDashboardView';
import { SimulationsView } from './components/SimulationsView';
import { AdminUsersView } from './components/AdminUsersView';
import { SplashAuthGate } from './components/SplashAuthGate';
import {
  AgentDashboardData,
  SimulationLiveTelemetry,
  TabId,
} from './types/dashboard';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  assigned_account: string;
  assigned_lob: 'voice' | 'chat' | 'email';
  cohort_stage: 'new_hire' | 'deployed_prod';
}

const MANAGEMENT_ROLES: UserRole[] = ['trainer', 'supervisor', 'manager', 'admin'];
const SROCI_ACADEMY_URL = 'https://sroci-academy.vercel.app';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [srociSimTelemetry, setSrociSimTelemetry] =
    useState<SimulationLiveTelemetry | null>(null);

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
    setSrociSimTelemetry(null);
    setActiveTab('dashboard');
  };

  if (!sessionChecked) {
    return (
      <div className="glass-canvas sroci-liquid-shell min-h-screen flex items-center justify-center text-sm text-slate-700">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="glass-canvas sroci-liquid-shell min-h-screen">
        {authError && (
          <div className="bg-rose-600/90 backdrop-blur-md text-white text-xs text-center py-2 px-4">
            {authError}
          </div>
        )}
        <SplashAuthGate
          accountHint={urlAccount}
          onAuthenticated={loadSessionAndProfile}
        />
      </div>
    );
  }

  const isAdmin = profile.role === 'admin';
  const isManagementRole = MANAGEMENT_ROLES.includes(profile.role);

  const formattedLob: 'Voice' | 'Chat' | 'Email' =
    profile.assigned_lob === 'chat'
      ? 'Chat'
      : profile.assigned_lob === 'email'
      ? 'Email'
      : 'Voice';

  const accountKey = (profile.assigned_account || 'SPAVI').toUpperCase();
  const isSroci = accountKey === 'SROCI' && !isAdmin;
  const canAccessSrociAcademy = isSroci;
  const basePreset = getAccountDashboardPreset(accountKey);

  const sidebarSubtitle = isAdmin
    ? 'Admin'
    : isSroci
    ? 'SROCI • Recruitment'
    : `${dashboardAccountNameOrKey(accountKey)} • ${formattedLob}`;

  const modeBadgeLabel = isAdmin
    ? 'Admin Mode'
    : isSroci
    ? 'Recruitment'
    : `${formattedLob} Mode`;

  const hasLiveSrociTelemetry =
    isSroci &&
    srociSimTelemetry !== null &&
    (srociSimTelemetry.completedStagesCount > 0 ||
      srociSimTelemetry.stageAttemptsCount > 0);

  const liveCompleted = hasLiveSrociTelemetry
    ? basePreset.kpis.completedSimulations +
      srociSimTelemetry!.completedStagesCount
    : basePreset.kpis.completedSimulations;

  const liveAttempts = hasLiveSrociTelemetry
    ? basePreset.kpis.totalAttempts + srociSimTelemetry!.stageAttemptsCount
    : basePreset.kpis.totalAttempts;

  const liveAssigned = hasLiveSrociTelemetry
    ? Math.max(
        basePreset.kpis.assignedDrills,
        srociSimTelemetry!.totalStagesCount
      )
    : basePreset.kpis.assignedDrills;

  const livePassed = hasLiveSrociTelemetry
    ? Math.min(
        liveAssigned,
        basePreset.kpis.passedScenarios +
          srociSimTelemetry!.completedStagesCount
      )
    : basePreset.kpis.passedScenarios;

  const liveAvgScore =
    hasLiveSrociTelemetry && srociSimTelemetry!.completedStagesCount > 0
      ? Math.min(
          99,
          Math.max(
            basePreset.kpis.avgScorePercent,
            Math.round(
              84 +
                (srociSimTelemetry!.completedStagesCount /
                  Math.max(srociSimTelemetry!.totalStagesCount, 1)) *
                  12
            )
          )
        )
      : basePreset.kpis.avgScorePercent;

  const livePassRate =
    hasLiveSrociTelemetry && liveAttempts > 0
      ? Math.min(
          100,
          Math.max(
            basePreset.kpis.passRatePercent,
            Math.round((liveCompleted / liveAttempts) * 100)
          )
        )
      : basePreset.kpis.passRatePercent;

  const liveTrend =
    hasLiveSrociTelemetry && srociSimTelemetry!.completedStagesCount > 0
      ? basePreset.proficiencyTrend.map((point, idx, arr) =>
          idx === arr.length - 1 ? { ...point, score: liveAvgScore } : point
        )
      : basePreset.proficiencyTrend;

  const liveBreakdown = hasLiveSrociTelemetry
    ? [
        {
          scenario: 'Ramp & Sourcing',
          completed:
            (basePreset.scenarioBreakdown[0]?.completed ?? 0) +
            srociSimTelemetry!.topicCounts['Ramp & Sourcing'],
        },
        {
          scenario: 'Screening & Validation',
          completed:
            (basePreset.scenarioBreakdown[1]?.completed ?? 0) +
            srociSimTelemetry!.topicCounts['Screening & Validation'],
        },
        {
          scenario: 'Walk-In & Tracker',
          completed:
            (basePreset.scenarioBreakdown[2]?.completed ?? 0) +
            srociSimTelemetry!.topicCounts['Walk-In & Tracker'],
        },
      ]
    : basePreset.scenarioBreakdown;

  const dashboardData: AgentDashboardData = {
    ...basePreset,
    accountName: accountKey,
    lob: formattedLob,
    agentName: profile.full_name || profile.email,
    cohortStage:
      profile.cohort_stage === 'deployed_prod'
        ? 'Deployed to Production'
        : 'New Hire',
    kpis: {
      ...basePreset.kpis,
      assignedDrills: liveAssigned,
      completedSimulations: liveCompleted,
      totalAttempts: liveAttempts,
      passedScenarios: livePassed,
      avgScorePercent: liveAvgScore,
      passRatePercent: livePassRate,
    },
    proficiencyTrend: liveTrend,
    scenarioBreakdown: liveBreakdown,
  };

  const visibleTabs = SIDEBAR_TABS.filter((tab) => {
    const roleOk = !tab.roles || tab.roles.includes(profile.role);
    const lobOk = !tab.lobs || tab.lobs.includes(profile.assigned_lob);
    return roleOk && lobOk;
  });

  const isAllowedCustomTab =
    activeTab === 'sroci_academy' && canAccessSrociAcademy;

  const safeActiveTab: TabId =
    visibleTabs.some((t) => t.id === activeTab) || isAllowedCustomTab
      ? activeTab
      : 'dashboard';

  const navMotionClass = 'sroci-alive-btn';

  return (
    <div className="glass-canvas sroci-liquid-shell sroci-liquid-theme min-h-screen text-slate-800 p-3 md:p-6">
      <div className="mx-auto max-w-[1400px] min-h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)] md:overflow-hidden rounded-3xl border border-white/85 bg-white/30 backdrop-blur-2xl flex flex-col md:flex-row shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.95),0_28px_70px_rgba(15,23,42,0.18)]">
        {/* Glass Left Sidebar */}
        <aside className="w-full md:w-60 bg-white/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/80 flex flex-col justify-between p-4 shrink-0 md:h-full md:min-h-0 z-20">
          <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="glass-card flex items-center gap-3 px-3.5 py-2.5 mb-5 shrink-0">
              <img
                src="/gicf-logo.jpg"
                alt="GICF Logo"
                className="h-8 w-auto object-contain mix-blend-multiply shrink-0"
              />
              <div className="border-l border-slate-400/35 pl-2.5">
                <div className="font-bold text-xs text-slate-900 leading-tight">
                  Testing Center
                </div>
                <div className="text-[11px] text-slate-600">
                  {sidebarSubtitle}
                </div>
              </div>
            </div>

            <nav className="space-y-1.5 overflow-y-auto pr-0.5 flex-1">
              {visibleTabs.map((tab) => {
                const isActive = safeActiveTab === tab.id;
                return (
                  <div key={tab.id} className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer ${navMotionClass} ${
                        isActive
                          ? 'bg-white/85 text-slate-900 border border-[#7e4cf6]/70 ring-2 ring-[#7e4cf6]/25 shadow-[0_6px_18px_rgba(126,76,246,0.16)]'
                          : 'text-slate-700 border border-transparent hover:bg-white/55 hover:border-white/85 hover:text-slate-900 hover:translate-x-0.5'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-700">
                          {tab.badge}
                        </span>
                      )}
                    </button>

                    {/* Place SROCI Academy directly below Simulations for SROCI users only */}
                    {tab.id === 'simulations' && canAccessSrociAcademy && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('sroci_academy')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer ${navMotionClass} ${
                          safeActiveTab === 'sroci_academy'
                            ? 'bg-white/85 text-slate-900 border border-[#7e4cf6]/70 ring-2 ring-[#7e4cf6]/25 shadow-[0_6px_18px_rgba(126,76,246,0.16)]'
                            : 'text-slate-700 border border-transparent hover:bg-white/55 hover:border-white/85 hover:text-slate-900 hover:translate-x-0.5'
                        }`}
                      >
                        <span>SROCI Academy</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#7e4cf6]/15 text-[#6b3be0]">
                          SROCI
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="glass-card mt-4 p-3 space-y-2 text-[11px] text-slate-700 shrink-0">
            <div className="truncate font-semibold text-slate-900">
              {isAdmin
                ? `Admin • ${profile.email}`
                : `${dashboardData.accountName} • ${profile.email}`}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className={`glass-btn w-full rounded-lg py-1.5 text-center text-xs font-semibold text-[#6b3be0] cursor-pointer ${navMotionClass}`}
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Glass Workspace */}
        <div className="flex-1 flex flex-col justify-between min-w-0 md:h-full md:min-h-0 md:overflow-y-auto md:pr-1">
          <div className="p-4 md:p-6 space-y-5">
            <header className="glass-card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="text-xs md:text-sm font-semibold text-slate-900">
                Welcome back, {dashboardData.agentName}
                <span className="ml-2 text-xs font-normal text-slate-600">
                  {isAdmin
                    ? '(Admin)'
                    : `(${dashboardData.accountName} • ${dashboardData.cohortStage} • ${profile.role})`}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    safeActiveTab === 'dashboard' ? 'simulations' : 'dashboard'
                  )
                }
                className={`glass-btn rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer ${navMotionClass}`}
              >
                {safeActiveTab === 'dashboard'
                  ? 'Go to Simulations'
                  : 'Back to Dashboard'}
              </button>
            </header>

            {safeActiveTab === 'dashboard' && (
              <div key="tab-dashboard" className="tab-panel-animate">
                <AgentDashboardView
                  data={dashboardData}
                  isAdmin={isAdmin}
                  onQuickAction={(action) => {
                    if (action === 'open_simulation') setActiveTab('simulations');
                  }}
                />
              </div>
            )}

            {safeActiveTab === 'simulations' && (
              <div key="tab-simulations" className="tab-panel-animate">
                <SimulationsView
                  accountName={dashboardData.accountName}
                  lob={formattedLob}
                  onTelemetryChange={setSrociSimTelemetry}
                />
              </div>
            )}

            {safeActiveTab === 'sroci_academy' && canAccessSrociAcademy && (
              <div key="tab-sroci-academy" className="tab-panel-animate space-y-4">
                <div className="glass-card sroci-liquid-elevated p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      SROCI Academy
                    </h2>
                    <p className="text-xs text-slate-600">
                      Separate SROCI learning portal — uses its own login without affecting your Testing Center session.
                    </p>
                  </div>
                  <a
                    href={SROCI_ACADEMY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`glass-btn rounded-xl px-3.5 py-1.5 text-xs font-semibold text-[#6b3be0] cursor-pointer ${navMotionClass}`}
                  >
                    Open in New Tab ↗
                  </a>
                </div>

                <div className="glass-card sroci-light-edge overflow-hidden rounded-2xl h-[calc(100vh-17rem)] min-h-[540px]">
                  <iframe
                    src={SROCI_ACADEMY_URL}
                    title="SROCI Academy"
                    className="w-full h-full border-0 bg-white/60"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              </div>
            )}

            {safeActiveTab === 'admin_users' && isManagementRole && (
              <div key="tab-admin-users" className="tab-panel-animate">
                <AdminUsersView />
              </div>
            )}
          </div>

          <footer className="px-4 md:px-6 pb-4">
            <div className="glass-card flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-medium text-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/75 border border-white px-2.5 py-0.5 text-slate-900">
                  {isAdmin ? 'Admin' : dashboardData.accountName}
                </span>
                <span className="rounded-full bg-[#7e4cf6]/15 px-2.5 py-0.5 text-purple-950">
                  {modeBadgeLabel}
                </span>
                <span className="rounded-full bg-white/65 px-2.5 py-0.5">
                  Interactive Chat Ready
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('simulations')}
                className={`rounded-xl bg-[#7e4cf6] px-3.5 py-1 text-xs font-semibold text-white border border-white/30 transition-all duration-200 hover:bg-[#6b3be0] hover:border-white/70 hover:-translate-y-0.5 active:scale-[0.97] active:ring-2 active:ring-[#7e4cf6]/40 cursor-pointer ${navMotionClass}`}
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

function dashboardAccountNameOrKey(accountKey: string): string {
  return accountKey || 'SPAVI';
}