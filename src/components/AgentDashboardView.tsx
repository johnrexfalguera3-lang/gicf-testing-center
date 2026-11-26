import { useEffect, useRef, useState } from 'react';
import { AgentDashboardData } from '../types/dashboard';

interface AgentDashboardViewProps {
  data: AgentDashboardData;
  isAdmin?: boolean;
  onQuickAction: (
    action: 'open_simulation' | 'view_full_trend' | 'view_full_scenarios'
  ) => void;
}

export function AgentDashboardView({
  data,
  isAdmin = false,
  onQuickAction,
}: AgentDashboardViewProps) {
  const { kpis, proficiencyTrend, scenarioBreakdown } = data;

  const isSroci = data.accountName?.trim().toUpperCase() === 'SROCI';
  const displayTrackLabel = isSroci ? 'RECRUITMENT' : data.lob;

  const [hoveredPreview, setHoveredPreview] = useState<
    'trend' | 'scenarios' | null
  >(null);
  const hoverTimerRef = useRef<number | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Slight hover delay so content fades in intentionally instead of snapping on instant brush-by
  const handleHoverStart = (panel: 'trend' | 'scenarios') => {
    if (!isSroci) return;
    clearHoverTimer();
    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredPreview(panel);
    }, 140);
  };

  const handleHoverEnd = () => {
    clearHoverTimer();
    setHoveredPreview(null);
  };

  useEffect(() => {
    return () => clearHoverTimer();
  }, []);

  const maxBreakdown = Math.max(
    ...scenarioBreakdown.map((item) => item.completed),
    1
  );

  const btnMotion = isSroci ? 'sroci-alive-btn' : '';
  const panelFade = isSroci ? 'sroci-fade-panel' : '';

  return (
    <div className={`space-y-5 ${panelFade}`}>
      {/* Header Card */}
      <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#7e4cf6]">
              <span className="rounded-full bg-[#7e4cf6]/15 px-2.5 py-0.5 text-[#6b3be0]">
                Admin
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#7e4cf6]">
              <span>{data.accountName}</span>
              <span>•</span>
              <span>{displayTrackLabel}</span>
              <span>•</span>
              <span className="rounded-full bg-white/75 border border-white/85 px-2.5 py-0.5 text-slate-800">
                {data.cohortStage}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Welcome back, {data.agentName}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {isAdmin
              ? 'Testing Center administration and readiness overview.'
              : `${data.accountName} practice overview and readiness summary.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onQuickAction('open_simulation')}
          className={`rounded-xl bg-[#7e4cf6] px-4 py-2.5 text-xs font-semibold text-white border border-white/30 shadow-md shadow-[#7e4cf6]/25 transition-all duration-150 hover:bg-[#6b3be0] hover:border-white/70 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#7e4cf6]/35 active:scale-[0.97] active:ring-2 active:ring-[#7e4cf6]/40 cursor-pointer ${btnMotion}`}
        >
          Launch Simulation →
        </button>
      </div>

      {/* KPI Grid */}
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

      {/* Charts & Scenario Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div
          onMouseLeave={handleHoverEnd}
          className="glass-card lg:col-span-7 p-5 space-y-4"
        >
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
              onMouseEnter={() => handleHoverStart('trend')}
              onClick={() => onQuickAction('view_full_trend')}
              className={`glass-btn rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer ${btnMotion}`}
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

          {isSroci && (
            <div
              className={`rounded-xl bg-white/75 border border-white px-3.5 py-2.5 text-xs text-slate-700 transition-all duration-300 ease-out ${
                hoveredPreview === 'trend'
                  ? 'opacity-100 translate-y-0 max-h-24'
                  : 'opacity-0 -translate-y-1 max-h-0 overflow-hidden py-0 border-transparent pointer-events-none'
              }`}
            >
              <span className="font-semibold text-[#6b3be0]">
                SROCI Trend Snapshot:
              </span>{' '}
              Latest run reached{' '}
              <strong>{proficiencyTrend[proficiencyTrend.length - 1]?.score ?? 90}%</strong>{' '}
              across prescreening, walk-in invites, and client tracker updates.
            </div>
          )}
        </div>

        <div
          onMouseLeave={handleHoverEnd}
          className="glass-card lg:col-span-5 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Scenario Breakdown
              </h2>
              <p className="text-xs text-slate-600">
                {isAdmin ? 'System-wide' : data.accountName} practice runs by topic
              </p>
            </div>
            <button
              type="button"
              onMouseEnter={() => handleHoverStart('scenarios')}
              onClick={() => onQuickAction('view_full_scenarios')}
              className={`glass-btn rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer ${btnMotion}`}
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

          {isSroci && (
            <div
              className={`rounded-xl bg-white/75 border border-white px-3.5 py-2.5 text-xs text-slate-700 transition-all duration-300 ease-out ${
                hoveredPreview === 'scenarios'
                  ? 'opacity-100 translate-y-0 max-h-24'
                  : 'opacity-0 -translate-y-1 max-h-0 overflow-hidden py-0 border-transparent pointer-events-none'
              }`}
            >
              <span className="font-semibold text-[#6b3be0]">
                SROCI Pipeline Focus:
              </span>{' '}
              Covers ramp checks, job posts, prescreening, profile validation, walk-in invites, and client tracker follow-ups.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}