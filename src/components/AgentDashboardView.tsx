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
      {/* Top Bento Row: Hero Metric Card + Two Summary Glass Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-3xl border border-white/85 bg-white/65 backdrop-blur-xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Completed Drills
            </span>
            <span className="rounded-full bg-white/80 border border-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
              {data.accountName}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-4xl font-bold tracking-tight text-slate-900">
              {kpis.completedSimulations}
              <span className="text-base font-medium text-slate-500 ml-1.5">
                / {kpis.assignedDrills}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('open_simulation')}
              className="rounded-xl bg-[#7e4cf6]/90 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#6b3be0] transition shadow-sm"
            >
              Practice Now →
            </button>
          </div>

          <div className="h-14 rounded-2xl border border-white/80 bg-white/55 px-3 flex items-center justify-between text-xs text-slate-600">
            <span>{kpis.totalAttempts} total attempts</span>
            <span className="font-semibold text-slate-800">
              {kpis.activeModules} active modules
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-white/85 bg-white/65 backdrop-blur-xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-600">
              Avg. Proficiency
            </div>
            <div className="text-3xl font-bold text-slate-900 my-2">
              {kpis.avgScorePercent}%
            </div>
            <div className="inline-flex w-fit rounded-full bg-emerald-500/10 border border-emerald-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              Pass rate {kpis.passRatePercent}%
            </div>
          </div>

          <div className="rounded-3xl border border-white/85 bg-white/65 backdrop-blur-xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-600">
              Passed Scenarios
            </div>
            <div className="text-3xl font-bold text-slate-900 my-2">
              {kpis.passedScenarios}
            </div>
            <div className="inline-flex w-fit rounded-full bg-purple-500/10 border border-purple-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-purple-900">
              Target 80%
            </div>
          </div>

          <div className="rounded-3xl border border-white/85 bg-white/65 backdrop-blur-xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-600">
              Needs Focus
            </div>
            <div className="text-3xl font-bold text-slate-900 my-2">
              {kpis.needsRetake}
            </div>
            <div className="inline-flex w-fit rounded-full bg-amber-500/10 border border-amber-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
              Ungraded retry
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bento Row: Trend Bars, Scenario Breakdown & Readiness Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-3xl border border-white/85 bg-white/65 backdrop-blur-xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Proficiency Trend
              </h2>
              <p className="text-xs text-slate-500">Recent practice runs</p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('view_full_trend')}
              className="rounded-xl border border-white/85 bg-white/75 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white transition"
            >
              View
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 h-36 items-end rounded-2xl border border-white/80 bg-white/50 p-3">
            {proficiencyTrend.map((pt) => (
              <div
                key={pt.label}
                className="flex flex-col items-center justify-end h-full gap-1.5"
              >
                <span className="text-[11px] font-semibold text-slate-700">
                  {pt.score}%
                </span>
                <div className="w-full max-w-[34px] h-20 rounded-xl bg-slate-200/60 flex items-end p-0.5 overflow-hidden">
                  <div
                    style={{ height: `${Math.min(pt.score, 100)}%` }}
                    className="w-full rounded-lg bg-gradient-to-t from-[#7e4cf6] to-sky-400"
                  />
                </div>
                <span className="text-[11px] text-slate-500">{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-3xl border border-white/85 bg-white/65 backdrop-blur-xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Scenario Activity
              </h2>
              <p className="text-xs text-slate-500">By topic area</p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction('view_full_scenarios')}
              className="rounded-xl border border-white/85 bg-white/75 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white transition"
            >
              All
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/80 bg-white/50 p-3.5">
            {scenarioBreakdown.map((row) => {
              const pct = Math.round((row.completed / maxBreakdown) * 100);
              return (
                <div key={row.scenario} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {row.scenario}
                    </span>
                    <span className="text-slate-500">{row.completed}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-[#7e4cf6]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-white/85 bg-white/65 backdrop-blur-xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Chat Readiness</h2>
            <p className="text-xs text-slate-500 mt-1">
              Practice scripted customer replies before moving to live AI.
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/55 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Order Status</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Ready
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Billing & Refund</span>
              <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-900">
                Ready
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Promos & Meals</span>
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                Ready
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onQuickAction('open_simulation')}
            className="w-full rounded-xl border border-white/85 bg-white/80 py-2 text-xs font-semibold text-slate-900 hover:bg-white transition"
          >
            Start Chat Drill
          </button>
        </div>
      </div>
    </div>
  );
}
