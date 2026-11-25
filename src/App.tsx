import { useState } from 'react';
import { SIDEBAR_TABS } from './config/sidebarTabs';
import { AgentDashboardView } from './components/AgentDashboardView';
import { AgentDashboardData, TabId } from './types/dashboard';

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
            {SIDEBAR_TABS.map((tab) => {
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

        <div className="px-2.5 pt-4 border-t border-white/10">
          <div className="text-[11px] text-slate-400">© 2026 GICF Training</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <AgentDashboardView
            data={SAMPLE_SPAVI_AGENT_DATA}
            onQuickAction={(action) => {
              if (action === 'open_simulation') setActiveTab('simulation');
            }}
          />
        )}
      </main>
    </div>
  );
}
