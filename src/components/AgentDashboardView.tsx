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

  const maxBreakdownCount = Math.max(
    ...scenarioBreakdown.map((item) => item.completed),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(14,10,36,0.05)]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#7e4cf6]">
            <span>{data.accountName}</span>
            <span>•</span>
            <span>{data.lob}</span>
            <span>•</span>
            <span className="rounded-full bg-purple-500/10 border border-purple-200/70 px-2.5 py-0.5 text-purple-900">
              {data.cohortStage}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Welcome back, {data.agentName}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track your readiness, review completed drills, and jump into practice simulations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onQuickAction('open_simulation')}
          className="rounded-xl bg-[#7e4cf6]/95 px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6b3be0] shadow-md shadow-[#7e4cf6]/25 transition"
        >
          Launch Simulation →
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-5 shadow-[0_8px_24px_rgba(14,10,36,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Completed Simulations
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {kpis.completedSimulations}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {kpis.assignedDrills} assigned
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {kpis.totalAttempts} total practice attempts
          </div>
        </div>

        <div className="rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-5 shadow-[0_8px_24px_rgba(14,10,36,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Average Proficiency
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#7e4cf6]">
              {kpis.avgScorePercent}%
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-500/10 border border-emerald-200/70 rounded-full px-2 py-0.5">
              Target 80%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Pass rate: {kpis.passRatePercent}%
          </div>
        </div>

        <div className="rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-5 shadow-[0_8px_24px_rgba(14,10,36,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Passed Scenarios
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">
              {kpis.passedScenarios}
            </span>
            <span className="text-xs font-medium text-slate-500">
              scenarios cleared
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {kpis.activeModules} active training modules
          </div>
        </div>

        <div className="rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-5 shadow-[0_8px_24px_rgba(14,10,36,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Needs Retake / Focus
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">
              {kpis.needsRetake}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {kpis.needsRetake === 1 ? 'scenario' : 'scenarios'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Self-paced practice available anytime
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Proficiency Trend */}
        <div className="lg:col-span-7 rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(14,10,36,0.05)] flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Proficiency Trend
              </h2>
              <p className="text-xs text-slate-500">
                Recent simulation runs vs. {proficiencyTrend[0]?.target ?? 80}% benchmark
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('view_full_trend')}
              className="rounded-xl border border-white/80 bg-white/75 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white transition"
            >
              Details
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-4 items-end h-48 rounded-xl border border-white/80 bg-white/55 backdrop-blur-md p-4">
            {proficiencyTrend.map((point) => {
              const meetsTarget = point.score >= point.target;
              return (
                <div
                  key={point.label}
                  className="flex flex-col items-center justify-end h-full gap-2"
                >
                  <span className="text-xs font-bold text-slate-800">
                    {point.score}%
                  </span>
                  <div className="w-full max-w-[44px] h-28 rounded-xl bg-slate-200/60 flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${Math.min(point.score, 100)}%` }}
                      className={`w-full rounded-lg transition-all ${
                        meetsTarget
                          ? 'bg-gradient-to-t from-[#7e4cf6] to-purple-400'
                          : 'bg-amber-400/90'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scenario Breakdown */}
        <div className="lg:col-span-5 rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(14,10,36,0.05)] flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Scenario Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Completed drills by inquiry category
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('view_full_scenarios')}
              className="rounded-xl border border-white/80 bg-white/75 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white transition"
            >
              Practice All
            </button>
          </div>

          <div className="space-y-3 rounded-xl border border-white/80 bg-white/55 backdrop-blur-md p-4">
            {scenarioBreakdown.map((item) => {
              const widthPercent = Math.round(
                (item.completed / maxBreakdownCount) * 100
              );
              return (
                <div key={item.scenario} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.scenario}
                    </span>
                    <span className="text-slate-600 font-medium">
                      {item.completed} {item.completed === 1 ? 'run' : 'runs'}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#7e4cf6] to-cyan-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-purple-500/10 backdrop-blur-md border border-purple-200/70 p-3.5 flex items-center justify-between gap-3">
            <div className="text-xs text-purple-950/90">
              Ready to warm up before your next evaluation?
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('open_simulation')}
              className="shrink-0 rounded-lg bg-[#7e4cf6]/95 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6b3be0] transition"
            >
              Open Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
