import React, { useMemo, useState } from 'react';
import { AgentDashboardData } from '../types/dashboard';

interface AgentDashboardViewProps {
  data: AgentDashboardData;
  onQuickAction?: (
    action: 'open_simulation' | 'view_full_trend' | 'view_full_scenarios'
  ) => void;
}

const KPI_STYLES = [
  { key: 'assignedDrills', label: 'Assigned Voice Drills', suffix: '', badgeBg: 'bg-indigo-100 text-indigo-600', valueColor: 'text-slate-900', icon: '📋' },
  { key: 'completedSimulations', label: 'Completed Simulations', suffix: '', badgeBg: 'bg-sky-100 text-sky-600', valueColor: 'text-slate-900', icon: '🎧' },
  { key: 'totalAttempts', label: 'Practice Attempts', suffix: '', badgeBg: 'bg-pink-100 text-pink-600', valueColor: 'text-slate-900', icon: '🔁' },
  { key: 'activeModules', label: 'Active Voice Modules', suffix: '', badgeBg: 'bg-amber-100 text-amber-600', valueColor: 'text-slate-900', icon: '📘' },
  { key: 'passedScenarios', label: 'Passed Scenarios', suffix: '', badgeBg: 'bg-emerald-100 text-emerald-600', valueColor: 'text-emerald-600', icon: '🏅' },
  { key: 'needsRetake', label: 'Needs Retake', suffix: '', badgeBg: 'bg-rose-100 text-rose-600', valueColor: 'text-rose-500', icon: '⚠️' },
  { key: 'avgScorePercent', label: 'Avg. Proficiency Score', suffix: '%', badgeBg: 'bg-orange-100 text-orange-600', valueColor: 'text-orange-500', icon: '📈' },
  { key: 'passRatePercent', label: 'Pass Rate', suffix: '%', badgeBg: 'bg-purple-100 text-purple-600', valueColor: 'text-[#7e4cf6]', icon: '✅' },
] as const;

export const AgentDashboardView: React.FC<AgentDashboardViewProps> = ({
  data,
  onQuickAction,
}) => {
  const [selectedLobFilter, setSelectedLobFilter] = useState<'Voice'>('Voice');
  const [selectedPeriod, setSelectedPeriod] = useState<
    'All Sessions' | 'This Week' | 'Post-Training'
  >('All Sessions');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScenarios = useMemo(() => {
    if (!searchTerm.trim()) return data.scenarioBreakdown;
    const q = searchTerm.toLowerCase();
    return data.scenarioBreakdown.filter((item) =>
      item.scenario.toLowerCase().includes(q)
    );
  }, [data.scenarioBreakdown, searchTerm]);

  const maxScenarioCount = useMemo(() => {
    return Math.max(...filteredScenarios.map((s) => s.completed), 1);
  }, [filteredScenarios]);

  return (
    <div className="space-y-6">
      {/* Top Bar: Title + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500">
            {data.accountName} • {data.lob} LOB Only • {data.cohortStage}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#7e4cf6]"
          />
        </div>
      </div>

      {/* Filter Pills Row (Locked to SPAVI Voice) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-700">
          Account:{' '}
          <span className="font-semibold text-slate-900">
            {data.accountName}
          </span>
        </div>

        <select
          aria-label="Line of Business"
          value={selectedLobFilter}
          onChange={(e) => setSelectedLobFilter(e.target.value as 'Voice')}
          className="bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#7e4cf6]"
        >
          <option value="Voice">Voice LOB (Only)</option>
        </select>

        <select
          aria-label="Timeframe"
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(
              e.target.value as 'All Sessions' | 'This Week' | 'Post-Training'
            )
          }
          className="bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#7e4cf6]"
        >
          <option value="All Sessions">All Sessions</option>
          <option value="This Week">This Week</option>
          <option value="Post-Training">Post-Training</option>
        </select>
      </div>

      {/* 8 KPI Cards (2 Rows x 4 Columns) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_STYLES.map((card) => {
          const rawValue = data.kpis[card.key];
          return (
            <div
              key={card.key}
              className="bg-white rounded-2xl p-5 border border-purple-100/80 shadow-[0_2px_10px_rgba(14,10,36,0.03)] flex flex-col justify-between min-h-[126px]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${card.badgeBg}`}
                >
                  {card.icon}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-500 font-medium">
                  {card.label}
                </div>
                <div className={`text-2xl font-bold mt-1 ${card.valueColor}`}>
                  {rawValue}
                  {card.suffix}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Proficiency Trend */}
        <div className="bg-white rounded-2xl p-6 border border-purple-100/80 shadow-[0_2px_10px_rgba(14,10,36,0.03)]">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Voice Proficiency Trend by Practice Run
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Agent Score vs. Target Passing Threshold (80%)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction?.('view_full_trend')}
              className="text-xs font-semibold text-[#7e4cf6] hover:underline"
            >
              View Full
            </button>
          </div>

          <div className="w-full h-52 bg-[#faf9ff] rounded-xl p-4 border border-purple-50 flex flex-col justify-between">
            <svg viewBox="0 0 400 150" className="w-full h-36 overflow-visible">
              <line
                x1="20"
                y1="42"
                x2="380"
                y2="42"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data.proficiencyTrend
                  .map((pt, idx) => {
                    const x =
                      data.proficiencyTrend.length === 1
                        ? 200
                        : 20 +
                          (idx / (data.proficiencyTrend.length - 1)) * 360;
                    const y =
                      135 - (Math.min(Math.max(pt.score, 0), 100) / 100) * 115;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {data.proficiencyTrend.map((pt, idx) => {
                const x =
                  data.proficiencyTrend.length === 1
                    ? 200
                    : 20 + (idx / (data.proficiencyTrend.length - 1)) * 360;
                const y =
                  135 - (Math.min(Math.max(pt.score, 0), 100) / 100) * 115;
                return <circle key={pt.label} cx={x} cy={y} r="4" fill="#6366f1" />;
              })}
            </svg>

            <div className="flex justify-between text-[11px] text-slate-400 px-2">
              {data.proficiencyTrend.map((pt) => (
                <span key={pt.label}>{pt.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Completed Voice Scenarios */}
        <div className="bg-white rounded-2xl p-6 border border-purple-100/80 shadow-[0_2px_10px_rgba(14,10,36,0.03)]">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Completed Voice Scenarios
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.accountName} • {data.lob} Call Drills
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction?.('view_full_scenarios')}
              className="text-xs font-semibold text-[#7e4cf6] hover:underline"
            >
              View Full
            </button>
          </div>

          <div className="w-full h-52 bg-[#faf9ff] rounded-xl p-4 border border-purple-50 flex items-end justify-around gap-4">
            {filteredScenarios.map((item) => {
              const heightPct = Math.max(
                12,
                Math.round((item.completed / maxScenarioCount) * 100)
              );
              return (
                <div
                  key={item.scenario}
                  className="flex flex-col items-center flex-1 h-full justify-end"
                >
                  <span className="text-xs font-semibold text-slate-700 mb-1">
                    {item.completed}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[72px] rounded-t-xl bg-[#7b83eb] transition-all"
                  />
                  <span className="text-[11px] text-slate-500 mt-2 text-center truncate w-full">
                    {item.scenario}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
