import { AgentDashboardData } from '../types/dashboard';

export interface AccountDirectoryEntry {
  code: string;
  accountName: string;
  trainerName: string;
  trainerEmail: string | null;
  lobLabel: string;
  isRecruitment: boolean;
}

export const ACCOUNT_DIRECTORY: Record<string, AccountDirectoryEntry> = {
  AMC: {
    code: 'AMC',
    accountName: 'AMC',
    trainerName: 'AMC Trainer',
    trainerEmail: 'trainer_amc@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  AMBER: {
    code: 'AMBER',
    accountName: 'Amber',
    trainerName: 'Amber Trainer',
    trainerEmail: 'trainer_amber@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  COLLECTIONS: {
    code: 'COLLECTIONS',
    accountName: 'Collections',
    trainerName: 'Trainer Collections',
    trainerEmail: 'trainer_collections@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  HEALTHWAY: {
    code: 'HEALTHWAY',
    accountName: 'Healthway',
    trainerName: 'Trainer Healthway',
    trainerEmail: 'trainer_healthway@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  LAZADA_PSC: {
    code: 'LAZADA_PSC',
    accountName: 'Lazada PSC',
    trainerName: 'Lazada PSC Trainer',
    trainerEmail: 'trainer_laz-psc@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  MIRAVIA: {
    code: 'MIRAVIA',
    accountName: 'Miravia',
    trainerName: 'Miravia Trainer',
    trainerEmail: null,
    lobLabel: 'General',
    isRecruitment: false,
  },
  PHILCARE: {
    code: 'PHILCARE',
    accountName: 'PhilCare',
    trainerName: 'PhilCare Trainer',
    trainerEmail: 'trainer_philcare@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  SPAVI: {
    code: 'SPAVI',
    accountName: 'SPAVI',
    trainerName: 'Spavi Trainer',
    trainerEmail: 'trainer_spavi@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  SROCI: {
    code: 'SROCI',
    accountName: 'Sroci',
    trainerName: 'Trainer Sroci',
    trainerEmail: 'trainer_sroci@gicf.ph',
    lobLabel: 'Recruitment',
    isRecruitment: true,
  },
  TMC: {
    code: 'TMC',
    accountName: 'TMC',
    trainerName: 'TMC Trainer',
    trainerEmail: null,
    lobLabel: 'General',
    isRecruitment: false,
  },
  WATSONS: {
    code: 'WATSONS',
    accountName: 'Watsons',
    trainerName: 'Watsons Trainer',
    trainerEmail: 'trainer_wtsn@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
  YAKAP: {
    code: 'YAKAP',
    accountName: 'Yakap',
    trainerName: 'Yakap Trainer',
    trainerEmail: 'trainer_yakap@gicf.ph',
    lobLabel: 'General',
    isRecruitment: false,
  },
};

function normalizeAccountCode(account: string): string {
  const cleaned = (account || 'SPAVI').trim().toUpperCase();
  if (cleaned === 'LAZADA PSC' || cleaned === 'LAZADA-PSC' || cleaned === 'LAZ-PSC') {
    return 'LAZADA_PSC';
  }
  return cleaned;
}

function buildStarterPreset(accountCode: string, displayName: string): AgentDashboardData {
  return {
    accountName: displayName,
    lob: 'Voice',
    agentName: `${displayName} Agent Preview`,
    cohortStage: 'New Hire',
    kpis: {
      assignedDrills: 6,
      completedSimulations: 2,
      totalAttempts: 3,
      activeModules: 2,
      passedScenarios: 2,
      needsRetake: 1,
      avgScorePercent: 84,
      passRatePercent: 67,
    },
    proficiencyTrend: [
      { label: 'Run 1', score: 74, target: 80 },
      { label: 'Run 2', score: 80, target: 80 },
      { label: 'Run 3', score: 86, target: 80 },
      { label: 'Run 4', score: 89, target: 80 },
    ],
    scenarioBreakdown: [
      { scenario: `${accountCode} Core Flow A`, completed: 1 },
      { scenario: `${accountCode} Core Flow B`, completed: 1 },
      { scenario: `${accountCode} Escalation & Follow-Up`, completed: 0 },
    ],
  };
}

export const ACCOUNT_DASHBOARD_PRESETS: Record<string, AgentDashboardData> = {
  AMC: buildStarterPreset('AMC', 'AMC'),
  AMBER: buildStarterPreset('AMBER', 'Amber'),
  COLLECTIONS: buildStarterPreset('COLLECTIONS', 'Collections'),
  HEALTHWAY: buildStarterPreset('HEALTHWAY', 'Healthway'),
  LAZADA_PSC: buildStarterPreset('LAZADA_PSC', 'Lazada PSC'),
  MIRAVIA: buildStarterPreset('MIRAVIA', 'Miravia'),
  PHILCARE: buildStarterPreset('PHILCARE', 'PhilCare'),
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
    accountName: 'Sroci',
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
  TMC: buildStarterPreset('TMC', 'TMC'),
  WATSONS: buildStarterPreset('WATSONS', 'Watsons'),
  YAKAP: buildStarterPreset('YAKAP', 'Yakap'),
};

export function getAccountDirectoryEntry(account: string): AccountDirectoryEntry {
  const key = normalizeAccountCode(account);
  return (
    ACCOUNT_DIRECTORY[key] ?? {
      code: key,
      accountName: account.trim() || 'SPAVI',
      trainerName: `${account.trim() || 'SPAVI'} Trainer`,
      trainerEmail: null,
      lobLabel: key === 'SROCI' ? 'Recruitment' : 'General',
      isRecruitment: key === 'SROCI',
    }
  );
}

export function getAccountDashboardPreset(account: string): AgentDashboardData {
  const key = normalizeAccountCode(account);
  if (ACCOUNT_DASHBOARD_PRESETS[key]) {
    return ACCOUNT_DASHBOARD_PRESETS[key];
  }
  return buildStarterPreset(key, account.trim() || 'SPAVI');
}