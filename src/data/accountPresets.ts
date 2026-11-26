import { AgentDashboardData } from '../types/dashboard';

export const ACCOUNT_DASHBOARD_PRESETS: Record<string, AgentDashboardData> = {
  SPAVI: {
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
  },
  SROCI: {
    accountName: 'SROCI',
    lob: 'Voice',
    agentName: 'Recruiter Preview',
    cohortStage: 'New Hire',
    kpis: {
      assignedDrills: 6,
      completedSimulations: 2,
      totalAttempts: 3,
      activeModules: 3,
      passedScenarios: 2,
      needsRetake: 1,
      avgScorePercent: 86,
      passRatePercent: 75,
    },
    proficiencyTrend: [
      { label: 'Run 1', score: 76, target: 80 },
      { label: 'Run 2', score: 82, target: 80 },
      { label: 'Run 3', score: 88, target: 80 },
      { label: 'Run 4', score: 90, target: 80 },
    ],
    scenarioBreakdown: [
      { scenario: 'Candidate Screening', completed: 2 },
      { scenario: 'Interview Scheduling', completed: 1 },
      { scenario: 'Offer & Onboarding', completed: 1 },
    ],
  },
};

export function getAccountDashboardPreset(account: string): AgentDashboardData {
  const key = account.trim().toUpperCase();
  return ACCOUNT_DASHBOARD_PRESETS[key] ?? ACCOUNT_DASHBOARD_PRESETS.SPAVI;
}