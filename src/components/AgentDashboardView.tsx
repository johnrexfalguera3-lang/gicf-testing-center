import { AgentDashboardData } from '../types/dashboard';

interface AgentDashboardViewProps {
  data: AgentDashboardData;
  onQuickAction: (
    action: 'open_simulation' | 'view_full_trend' | 'view_full_scenarios'
  ) => void;
}

export function AgentDashboardView({
  data,
  onQuickAction,
}: AgentDashboardViewProps) {
  const { kpis, proficiencyTrend, scenarioBreakdown } = data;

  const maxBreakdown = Math.max(
    ...scenarioBreakdown.map((item) => item.completed),
    1
  );

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#7e4cf6]">
            <span>{data.accountName}</span>
            <span>•</span>
            <span>{data.lob}</span>
            <span>•</span>
            <span className="rounded-full bg-white/75 border border-white/80 px-2.5 py-0.5 text-slate-800">
              {data.cohortStage}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Welcome back, {data.agentName}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {data.accountName} practice overview and readiness summary.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onQuickAction('open_simulation')}
          className="rounded-2xl bg-[#7e4cf6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6b3be0] transition shadow-sm"
        >
          Launch Simulation →
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Completed Simulations
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {kpis.completedSimulations}
            </span>
            <span className="text-xs text-slate-600">
              / {kpis.assignedDrills} assigned
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {kpis.totalAttempts} total attempts
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Average Proficiency
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#7e4cf6]">
              {kpis.avgScorePercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-500/15 rounded-full px-2 py-0.5">
              Target 80%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Pass rate: {kpis.passRatePercent}%
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Passed Scenarios
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">
              {kpis.passedScenarios}
            </span>
            <span className="text-xs text-slate-600">cleared</span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {kpis.activeModules} active modules
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Needs Focus
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-700">
              {kpis.needsRetake}
            </span>
            <span className="text-xs text-slate-600">
              {kpis.needsRetake === 1 ? 'scenario' : 'scenarios'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Self-paced retry available
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="glass-card lg:col-span-7 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Proficiency Trend
              </h2>
              <p className="text-xs text-slate-600">
                Recent runs vs. {proficiencyTrend[0]?.target ?? 80}% target
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('view_full_trend')}
              className="glass-card px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-white/75 transition"
            >
              Details
            </button>
          </div>

          <div className="glass-card grid grid-cols-4 gap-3 h-44 items-end p-4">
            {proficiencyTrend.map((point) => (
              <div
                key={point.label}
                className="flex flex-col items-center justify-end h-full gap-1.5"
              >
                <span className="text-xs font-bold text-slate-800">
                  {point.score}%
                </span>
                <div className="w-full max-w-[40px] h-24 rounded-xl bg-white/50 flex items-end p-0.5 overflow-hidden">
                  <div
                    style={{ height: `${Math.min(point.score, 100)}%` }}
                    className="w-full rounded-lg bg-[#7e4cf6]"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-700">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card lg:col-span-5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Scenario Breakdown
              </h2>
              <p className="text-xs text-slate-600">
                {data.accountName} practice runs by topic
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('view_full_scenarios')}
              className="glass-card px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-white/75 transition"
            >
              Practice All
            </button>
          </div>

          <div className="glass-card space-y-3 p-4">
            {scenarioBreakdown.map((item) => {
              const widthPercent = Math.round(
                (item.completed / maxBreakdown) * 100
              );
              return (
                <div key={item.scenario} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.scenario}
                    </span>
                    <span className="text-slate-600 font-medium">
                      {item.completed}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className="h-full rounded-full bg-[#7e4cf6]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
