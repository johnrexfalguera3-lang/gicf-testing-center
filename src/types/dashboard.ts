export type TabId =
  | 'dashboard'
  | 'simulations'
  | 'sroci_academy'
  | 'admin_users';

export interface SidebarTab {
  id: TabId;
  label: string;
  badge?: string;
}

export interface AgentDashboardData {
  accountName: string;
  lob: 'Voice' | 'Chat' | 'Email';
  agentName: string;
  cohortStage: 'New Hire' | 'Deployed to Production';
  kpis: {
    assignedDrills: number;
    completedSimulations: number;
    totalAttempts: number;
    activeModules: number;
    passedScenarios: number;
    needsRetake: number;
    avgScorePercent: number;
    passRatePercent: number;
  };
  proficiencyTrend: {
    label: string;
    score: number;
    target: number;
  }[];
  scenarioBreakdown: {
    scenario: string;
    completed: number;
  }[];
}