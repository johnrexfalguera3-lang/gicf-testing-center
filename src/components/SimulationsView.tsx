import { useEffect, useMemo, useState } from 'react';
import { ChatPracticeBox } from './ChatPracticeBox';
import { SrociRecruitmentSimBox } from './SrociRecruitmentSimBox';
import { CHAT_SIMULATION_PROMPTS } from '../data/chatSimulationPrompts';
import { SimulationLiveTelemetry } from '../types/dashboard';

type ChannelMode = 'Voice' | 'Chat' | 'Email';
type TopicFilter =
  | 'All'
  | 'Order Status'
  | 'Billing / Refund'
  | 'Escalations'
  | 'Ramp & Sourcing'
  | 'Screening & Validation'
  | 'Walk-In & Tracker';

type SrociStageId =
  | 'ramp_check'
  | 'job_posting'
  | 'prescreening'
  | 'profile_validation'
  | 'walk_in_invite'
  | 'client_tracker'
  | 'status_followup';

type SrociSubView =
  | 'cards'
  | 'ramp_post'
  | 'prescreen_validate'
  | 'walkin_tracker';

interface SrociStageDefinition {
  id: SrociStageId;
  stepNumber: number;
  title: string;
  shortLabel: string;
  badge: string;
  subView: Exclude<SrociSubView, 'cards'>;
  baseXp: number;
  promptQuestion: string;
  hint: string;
  options: {
    id: string;
    label: string;
    detail: string;
    isOptimal: boolean;
    outcomeLabel: string;
    coaching: string;
  }[];
}

interface StageProgressState {
  completed: boolean;
  attempts: number;
  usedHint: boolean;
  xpEarned: number;
  statusNote: string;
}

interface TrackerLogEntry {
  candidate: string;
  stage: string;
  status: 'Endorsed' | 'Walk-In Scheduled' | 'Passed' | 'Failed' | 'Hired';
  updatedBy: string;
}

interface PersistedSrociSimState {
  stageProgress: Record<SrociStageId, StageProgressState>;
  practicedIds: string[];
  notesById: Record<string, string>;
  trackerLog: TrackerLogEntry[];
  dynamicXp: number;
  xpStreak: number;
}

interface ScenarioItem {
  id: string;
  accountScope: 'SPAVI' | 'SROCI';
  channel: ChannelMode;
  topic: Exclude<TopicFilter, 'All'>;
  title: string;
  summary: string;
  estimatedMinutes: number;
  situation: string;
  responseFlow: string[];
  reminders: string[];
}

interface SimulationsViewProps {
  accountName: string;
  lob?: 'Voice' | 'Chat' | 'Email';
  onTelemetryChange?: (telemetry: SimulationLiveTelemetry) => void;
}

const SROCI_PIPELINE_STAGES: SrociStageDefinition[] = [
  {
    id: 'ramp_check',
    stepNumber: 1,
    title: 'Ramp Check',
    shortLabel: 'Ramp Check',
    badge: 'Client Brief',
    subView: 'ramp_post',
    baseXp: 90,
    promptQuestion:
      'Client ramp sheet says 20 seats urgent, but shift shows "Night" on tab 1 and "Day" on tab 2 with no site address. What do you do first?',
    hint: 'Verify shift schedule, headcount target, and walk-in site address before publishing or screening.',
    options: [
      {
        id: 'a',
        label: 'Confirm shift, headcount & site location with client/lead before posting',
        detail: 'Prevents conflicting job ads and candidate confusion',
        isOptimal: true,
        outcomeLabel: 'Ramp Verified ✓',
        coaching: 'Great ramp check—confirming conflicting shift and site info early protects pipeline accuracy.',
      },
      {
        id: 'b',
        label: 'Start sourcing immediately using tab 1 only',
        detail: 'Assumes tab 1 is final without checking tab 2',
        isOptimal: false,
        outcomeLabel: 'Needs Recheck',
        coaching: 'Always reconcile ramp discrepancies first so recruiters and applicants work from one source of truth.',
      },
    ],
  },
  {
    id: 'job_posting',
    stepNumber: 2,
    title: 'Job Posting',
    shortLabel: 'Job Post',
    badge: 'Sourcing Ad',
    subView: 'ramp_post',
    baseXp: 95,
    promptQuestion:
      'Ramp details are confirmed for Night Shift (10 PM – 7 AM) at Ortigas Walk-In Hub. Which job post setup is strongest?',
    hint: 'Include clear role title, shift schedule, site walk-in expectation, and key qualifications.',
    options: [
      {
        id: 'a',
        label: 'Publish clear ad with role, Night Shift schedule, Ortigas walk-in info & key fit points',
        detail: 'Attracts aligned applicants ready for walk-in',
        isOptimal: true,
        outcomeLabel: 'Job Post Live ✓',
        coaching: 'Clear shift and walk-in expectations filter in better-fit candidates right from the job post.',
      },
      {
        id: 'b',
        label: 'Post a vague 1-line ad with no shift or site details',
        detail: 'High volume, low walk-in alignment',
        isOptimal: false,
        outcomeLabel: 'Needs Polish',
        coaching: 'Vague job posts lead to mismatched prescreens and walk-in drop-offs.',
      },
    ],
  },
  {
    id: 'prescreening',
    stepNumber: 3,
    title: 'Prescreening',
    shortLabel: 'Prescreen',
    badge: 'Knockout & Fit',
    subView: 'prescreen_validate',
    baseXp: 100,
    promptQuestion:
      'Applicant says they love the role but can only work Day Shift and cannot visit the site. What is your move?',
    hint: 'Check non-negotiable shift and site walk-in fit during prescreening.',
    options: [
      {
        id: 'a',
        label: 'Politely explain Night/site requirements, disposition for this ramp, or log for matching roles',
        detail: 'Respectful candidate closure + clean funnel',
        isOptimal: true,
        outcomeLabel: 'Screened & Dispositioned ✓',
        coaching: 'Firm, polite prescreening keeps walk-in slots focused on qualified, available candidates.',
      },
      {
        id: 'b',
        label: 'Endorse anyway to hit daily outreach count',
        detail: 'Sends mismatched candidate forward',
        isOptimal: false,
        outcomeLabel: 'Needs Focus',
        coaching: 'Endorsing unaligned applicants hurts client quality and conversion metrics.',
      },
    ],
  },
  {
    id: 'profile_validation',
    stepNumber: 4,
    title: 'Profile Validation',
    shortLabel: 'Validate',
    badge: 'Data & Fit Audit',
    subView: 'prescreen_validate',
    baseXp: 105,
    promptQuestion:
      'Candidate passed prescreening. Their profile has a typo in their mobile number and a 15-day notice period. How do you validate?',
    hint: 'Confirm reachable contact details, work/notice availability, and accurate profile fields.',
    options: [
      {
        id: 'a',
        label: 'Verify working mobile number, confirm 15-day notice window, and update profile notes',
        detail: 'Accurate contact + realistic start expectation',
        isOptimal: true,
        outcomeLabel: 'Profile Validated ✓',
        coaching: 'Clean contact verification and notice-period clarity prevent downstream bottlenecks.',
      },
      {
        id: 'b',
        label: 'Skip contact check and mark profile "Ready for Hire"',
        detail: 'Unverified phone & unconfirmed notice',
        isOptimal: false,
        outcomeLabel: 'Needs Audit',
        coaching: 'Always verify reachable contact details and notice availability during profile validation.',
      },
    ],
  },
  {
    id: 'walk_in_invite',
    stepNumber: 5,
    title: 'Walk-In Invite',
    shortLabel: 'Walk-In',
    badge: 'Site Invite',
    subView: 'walkin_tracker',
    baseXp: 110,
    promptQuestion:
      'Candidate is validated for tomorrow’s site walk-in. What makes your walk-in invite most effective?',
    hint: 'Include date, reporting time, exact site address/landmarks, valid ID/CV reminder, and confirmation ask.',
    options: [
      {
        id: 'a',
        label: 'Send exact date, time, site address, required ID/CV & ask candidate to reply "Confirmed"',
        detail: 'High clarity + show-up confirmation',
        isOptimal: true,
        outcomeLabel: 'Walk-In Invited ✓',
        coaching: 'Clear logistics plus a confirmation reply significantly improves walk-in show rates.',
      },
      {
        id: 'b',
        label: 'Send "See you at the site tomorrow" without time, address, or ID reminders',
        detail: 'Incomplete walk-in instructions',
        isOptimal: false,
        outcomeLabel: 'Needs Detail',
        coaching: 'Incomplete walk-in invites often result in late arrivals or no-shows.',
      },
    ],
  },
  {
    id: 'client_tracker',
    stepNumber: 6,
    title: 'Client Tracker',
    shortLabel: 'Tracker',
    badge: 'Endorsement Log',
    subView: 'walkin_tracker',
    baseXp: 115,
    promptQuestion:
      'Candidate completed walk-in assessment and is endorsed to the client. How do you log them in the shared client tracker?',
    hint: 'Enter complete, accurate candidate details and set endorsement status cleanly without overwriting rows.',
    options: [
      {
        id: 'a',
        label: 'Add a complete new row with accurate name, contact, date & "Endorsed" status',
        detail: 'Clean shared tracker record',
        isOptimal: true,
        outcomeLabel: 'Endorsed in Tracker ✓',
        coaching: 'Accurate, non-destructive tracker entries keep recruiter and client counts in sync.',
      },
      {
        id: 'b',
        label: 'Leave status blank or edit someone else’s candidate row',
        detail: 'Tracker discrepancy risk',
        isOptimal: false,
        outcomeLabel: 'Needs Correction',
        coaching: 'Keep every tracker entry complete and accurate so endorsements are easy to audit.',
      },
    ],
  },
  {
    id: 'status_followup',
    stepNumber: 7,
    title: 'Status Follow-Up',
    shortLabel: 'Follow-Up',
    badge: 'Passed / Failed / Hired',
    subView: 'walkin_tracker',
    baseXp: 125,
    promptQuestion:
      'Client updates the shared tracker: Candidate A is HIRED, Candidate B PASSED final stage, and Candidate C FAILED. What is your follow-up?',
    hint: 'Update statuses consistently in the tracker and follow up appropriately for Hired, Passed, and Failed outcomes.',
    options: [
      {
        id: 'a',
        label: 'Sync Hired / Passed / Failed statuses in tracker, guide Hired/Passed next steps & close Failed politely',
        detail: 'Complete status loop & candidate care',
        isOptimal: true,
        outcomeLabel: 'Follow-Up Complete ✓',
        coaching: 'Following up on Hired, Passed, and Failed statuses closes the recruitment loop cleanly.',
      },
      {
        id: 'b',
        label: 'Leave all three on "Endorsed" and skip candidate updates',
        detail: 'Outdated tracker & unanswered candidates',
        isOptimal: false,
        outcomeLabel: 'Needs Follow-Up',
        coaching: 'Timely status updates and follow-ups keep both candidates and client trackers aligned.',
      },
    ],
  },
];

const SCENARIOS: ScenarioItem[] = [
  {
    id: 'voice-order-status',
    accountScope: 'SPAVI',
    channel: 'Voice',
    topic: 'Order Status',
    title: 'Order Status & Delivery Update',
    summary: 'Reassure a caller checking on a delayed order and set clear next steps.',
    estimatedMinutes: 5,
    situation:
      'A SPAVI customer calls asking why their order is still showing in transit past the initial estimate and wants to know when it will arrive.',
    responseFlow: [
      'Warm voice greeting + confirm caller name and order details.',
      'Acknowledge the delay calmly without sounding defensive.',
      'Check latest tracking status, explain what it means in plain language, and share clear next steps.',
      'Confirm if there is anything else you can help with before closing.',
    ],
    reminders: [
      'Keep tone steady, empathetic, and clear.',
      'Avoid promising exact arrival times if carrier status only shows a window.',
    ],
  },
  {
    id: 'voice-billing-refund',
    accountScope: 'SPAVI',
    channel: 'Voice',
    topic: 'Billing / Refund',
    title: 'Billing & Refund Clarification',
    summary: 'Walk a caller through a charge or refund timeline clearly and patiently.',
    estimatedMinutes: 7,
    situation:
      'A SPAVI caller asks about card payment options and how long a refund takes to post back to their account.',
    responseFlow: [
      'Acknowledge the billing question politely and verify account context.',
      'Explain accepted payment or refund timelines clearly.',
      'Summarize what happens next and offer additional help.',
    ],
    reminders: [
      'State processing windows plainly so expectations stay realistic.',
      'Check back in before ending the call.',
    ],
  },
  {
    id: 'voice-escalations',
    accountScope: 'SPAVI',
    channel: 'Voice',
    topic: 'Escalations',
    title: 'Frustrated Caller De-Escalation',
    summary: 'Lower tension on a live call, own the moment, and guide toward resolution.',
    estimatedMinutes: 8,
    situation:
      'A SPAVI caller is frustrated about repeated delays or promo/bundle confusion and wants a clear resolution.',
    responseFlow: [
      'Let the caller share their concern without interrupting.',
      'Validate frustration and state what you can check or do right now.',
      'Confirm the next step and check if they feel supported.',
    ],
    reminders: [
      'Stay calm and concise even when the caller sounds upset.',
      'Focus on actionable next steps.',
    ],
  },
  {
    id: 'chat-order-status',
    accountScope: 'SPAVI',
    channel: 'Chat',
    topic: 'Order Status',
    title: 'Delayed Order Check-In',
    summary: 'Practice live chat replies for a SPAVI order past its initial delivery window.',
    estimatedMinutes: 6,
    situation:
      'A SPAVI customer messages on chat asking why their order is still in transit past the initial estimate.',
    responseFlow: [
      'Greet the customer warmly and acknowledge the wait.',
      'Explain current status clearly without overpromising.',
      'Share clear next steps and ask if anything else is needed.',
    ],
    reminders: [
      'Keep chat messages easy to scan—short paragraphs work best.',
      'Confirm follow-up steps clearly.',
    ],
  },
  {
    id: 'chat-billing-refund',
    accountScope: 'SPAVI',
    channel: 'Chat',
    topic: 'Billing / Refund',
    title: 'Card Payment & Refund Timeline',
    summary: 'Guide a SPAVI chat customer through card payments and refund processing windows.',
    estimatedMinutes: 6,
    situation:
      'A SPAVI customer asks on chat if credit cards are accepted and how long refunds take.',
    responseFlow: [
      'Answer the payment question directly.',
      'Clarify refund timing and what affects posting speed.',
      'Ask if they need help reviewing anything else.',
    ],
    reminders: [
      'Be direct and clear on timelines.',
      'Keep tone helpful and low-pressure.',
    ],
  },
  {
    id: 'chat-escalations',
    accountScope: 'SPAVI',
    channel: 'Chat',
    topic: 'Escalations',
    title: 'Promo vs. Group Meal & BOGO Options',
    summary: 'Help a SPAVI chat customer compare promos, group meals, and BOGO choices.',
    estimatedMinutes: 6,
    situation:
      'A SPAVI customer skips a promo code in chat to ask about group meals and buy-one-take-one options.',
    responseFlow: [
      'Match their focus on group meals or BOGO options right away.',
      'Explain selection rules or bundle details plainly.',
      'Offer clear next steps for their order.',
    ],
    reminders: [
      'Avoid pushing unrelated promos when they ask for group/BOGO options.',
      'Keep options clear and structured.',
    ],
  },
  {
    id: 'email-order-status',
    accountScope: 'SPAVI',
    channel: 'Email',
    topic: 'Order Status',
    title: 'Written Order Status Follow-Up',
    summary: 'Draft a clear, structured email update on a SPAVI order delay.',
    estimatedMinutes: 7,
    situation:
      'A SPAVI customer emails asking for a clear status update and next steps on a delayed order.',
    responseFlow: [
      'Open with a polite acknowledgment and clear subject/context.',
      'Summarize current status and next steps in plain language.',
      'Close with a helpful sign-off inviting any follow-up questions.',
    ],
    reminders: [
      'Keep written updates organized and easy to read.',
      'Avoid jargon or unconfirmed promises.',
    ],
  },
  {
    id: 'sroci-voice-prescreen-walkin',
    accountScope: 'SROCI',
    channel: 'Voice',
    topic: 'Screening & Validation',
    title: 'Prescreening Call & Walk-In Qualification',
    summary: 'Screen a candidate on voice against the client ramp and invite qualified applicants for walk-in.',
    estimatedMinutes: 7,
    situation:
      'You are calling an applicant for an SROCI ramp role. Confirm shift willingness, site walk-in availability, and basic qualifications before inviting them to the site.',
    responseFlow: [
      'Introduce yourself, the SROCI recruitment team, and the role being hired for.',
      'Check client ramp non-negotiables (shift schedule, work setup/site location, key qualifications).',
      'Validate candidate profile details and notice period/start readiness.',
      'Invite qualified candidates to the walk-in hub with clear expectations or politely close if unmatched.',
    ],
    reminders: [
      'Confirm walk-in willingness before locking in a site slot.',
      'Keep candidate expectations accurate to the client ramp.',
    ],
  },
  {
    id: 'sroci-voice-status-followup',
    accountScope: 'SROCI',
    channel: 'Voice',
    topic: 'Walk-In & Tracker',
    title: 'Client Outcome Call: Passed, Failed, or Hired',
    summary: 'Follow up with candidates and align tracker status after client evaluation.',
    estimatedMinutes: 6,
    situation:
      'The client updated the shared tracker with candidate outcomes (Passed, Failed, or Hired). Conduct a clear voice follow-up and confirm tracker accuracy.',
    responseFlow: [
      'Verify the exact outcome posted by the client in the shared tracker.',
      'Deliver clear, respectful feedback—congratulate Hired/Passed candidates or close out Failed ones courteously.',
      'Align onboarding/start instructions or re-sourcing next steps.',
      'Double-check that the shared tracker reflects the latest status.',
    ],
    reminders: [
      'Never leave Hired or Failed statuses stale in the shared tracker.',
      'Maintain a supportive, professional tone across all outcomes.',
    ],
  },
  {
    id: 'sroci-chat-ramp-prescreen',
    accountScope: 'SROCI',
    channel: 'Chat',
    topic: 'Ramp & Sourcing',
    title: 'Ramp Check, Job Post & Chat Prescreening',
    summary: 'Verify client ramp details for job posting and run fast chat prescreening.',
    estimatedMinutes: 6,
    situation:
      'A client ramp brief has updated headcount and shift details. Confirm job post alignment and prescreen an inbound applicant on live chat.',
    responseFlow: [
      'Check ramp requirements (role, shift, site/walk-in details) before posting or screening.',
      'Ask concise chat prescreening questions to validate fit and availability.',
      'Confirm profile accuracy and move qualified candidates toward walk-in invite.',
    ],
    reminders: [
      'Keep chat prescreen questions short, direct, and easy to answer.',
      'Spot mismatches early so walk-in slots stay high-quality.',
    ],
  },
  {
    id: 'sroci-chat-walkin-tracker',
    accountScope: 'SROCI',
    channel: 'Chat',
    topic: 'Walk-In & Tracker',
    title: 'Walk-In Invite & Shared Tracker Logging',
    summary: 'Coordinate a site walk-in on chat and log accurate endorsement details in the client tracker.',
    estimatedMinutes: 6,
    situation:
      'A candidate passed profile validation. Invite them to walk in on chat and endorse their profile accurately into the shared client tracker.',
    responseFlow: [
      'Share walk-in schedule, site location, and required items clearly on chat.',
      'Ask for confirmation so show-up rates stay predictable.',
      'Log complete, error-free endorsement details in the shared client tracker.',
    ],
    reminders: [
      'Verify candidate name, contact info, and endorsement status in the tracker.',
      'Keep walk-in instructions clear and complete.',
    ],
  },
  {
    id: 'sroci-email-walkin-followup',
    accountScope: 'SROCI',
    channel: 'Email',
    topic: 'Walk-In & Tracker',
    title: 'Walk-In Invite, Endorsement & Status Follow-Up Email',
    summary: 'Send clear written walk-in invites, client endorsement notes, and status updates.',
    estimatedMinutes: 7,
    situation:
      'You need to send a written walk-in invitation to a validated candidate and follow up on tracker status (Passed, Failed, or Hired) with clear next steps.',
    responseFlow: [
      'State the purpose, role/ramp details, and key dates/times clearly at the top.',
      'Include exact walk-in instructions or status follow-up details (Passed, Failed, or Hired).',
      'Confirm tracker tracking and invite replies for scheduling or onboarding.',
    ],
    reminders: [
      'Use clear headings or bullet points for schedules and requirements.',
      'Ensure written updates match the shared client tracker.',
    ],
  },
];

const DEFAULT_TRACKER_LOG: TrackerLogEntry[] = [
  { candidate: 'M. Reyes', stage: 'Prescreening', status: 'Walk-In Scheduled', updatedBy: 'SROCI' },
  { candidate: 'A. Mendoza', stage: 'Profile Validation', status: 'Endorsed', updatedBy: 'SROCI' },
  { candidate: 'H. Lim', stage: 'Status Follow-Up', status: 'Hired', updatedBy: 'Client Tracker' },
];

function createInitialStageProgress(): Record<SrociStageId, StageProgressState> {
  return SROCI_PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = {
      completed: false,
      attempts: 0,
      usedHint: false,
      xpEarned: 0,
      statusNote: 'Ready to play',
    };
    return acc;
  }, {} as Record<SrociStageId, StageProgressState>);
}

function readPersistedSrociState(storageKey: string): PersistedSrociSimState | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedSrociSimState>;
    const mergedStages = createInitialStageProgress();
    if (parsed.stageProgress) {
      for (const stage of SROCI_PIPELINE_STAGES) {
        const savedStage = parsed.stageProgress[stage.id];
        if (savedStage) {
          mergedStages[stage.id] = {
            ...mergedStages[stage.id],
            ...savedStage,
          };
        }
      }
    }
    return {
      stageProgress: mergedStages,
      practicedIds: Array.isArray(parsed.practicedIds) ? parsed.practicedIds : [],
      notesById:
        parsed.notesById && typeof parsed.notesById === 'object'
          ? parsed.notesById
          : {},
      trackerLog:
        Array.isArray(parsed.trackerLog) && parsed.trackerLog.length > 0
          ? parsed.trackerLog
          : DEFAULT_TRACKER_LOG,
      dynamicXp: typeof parsed.dynamicXp === 'number' ? parsed.dynamicXp : 0,
      xpStreak: typeof parsed.xpStreak === 'number' ? parsed.xpStreak : 0,
    };
  } catch {
    return null;
  }
}

export function SimulationsView({
  accountName,
  lob,
  onTelemetryChange,
}: SimulationsViewProps) {
  const normalizedAccount = (accountName || 'SPAVI').trim().toUpperCase();
  const isSroci = normalizedAccount === 'SROCI';
  const simStorageKey = `sroci_simulations_state_${normalizedAccount}`;

  const initialMode: ChannelMode =
    lob === 'Chat' || lob === 'Email' || lob === 'Voice' ? lob : 'Voice';

  const availableTopics: TopicFilter[] = useMemo(
    () =>
      isSroci
        ? ['All', 'Ramp & Sourcing', 'Screening & Validation', 'Walk-In & Tracker']
        : ['All', 'Order Status', 'Billing / Refund', 'Escalations'],
    [isSroci]
  );

  const accountScenarios = useMemo(
    () => SCENARIOS.filter((s) => s.accountScope === (isSroci ? 'SROCI' : 'SPAVI')),
    [isSroci]
  );

  const [mode, setMode] = useState<ChannelMode>(initialMode);
  const [topic, setTopic] = useState<TopicFilter>('All');
  const [selectedId, setSelectedId] = useState<string>(accountScenarios[0]?.id ?? '');
  const [practicedIds, setPracticedIds] = useState<string[]>(() => {
    if (!isSroci) return [];
    return readPersistedSrociState(simStorageKey)?.practicedIds ?? [];
  });
  const [notesById, setNotesById] = useState<Record<string, string>>(() => {
    if (!isSroci) return {};
    return readPersistedSrociState(simStorageKey)?.notesById ?? {};
  });
  const [selectedChatPromptId, setSelectedChatPromptId] = useState<string>(
    CHAT_SIMULATION_PROMPTS[0].id
  );
  const [showInteractiveSim, setShowInteractiveSim] = useState<boolean>(isSroci);

  const [srociSubView, setSrociSubView] = useState<SrociSubView>('cards');
  const [activeStageId, setActiveStageId] = useState<SrociStageId>('ramp_check');
  const [stageProgress, setStageProgress] = useState<Record<SrociStageId, StageProgressState>>(
    () => {
      if (!isSroci) return createInitialStageProgress();
      return readPersistedSrociState(simStorageKey)?.stageProgress ?? createInitialStageProgress();
    }
  );
  const [showStageHint, setShowStageHint] = useState<boolean>(false);
  const [dynamicXp, setDynamicXp] = useState<number>(() => {
    if (!isSroci) return 0;
    return readPersistedSrociState(simStorageKey)?.dynamicXp ?? 0;
  });
  const [xpStreak, setXpStreak] = useState<number>(() => {
    if (!isSroci) return 0;
    return readPersistedSrociState(simStorageKey)?.xpStreak ?? 0;
  });
  const [lastXpAward, setLastXpAward] = useState<{
    total: number;
    breakdown: string[];
    feedback: string;
    isOptimal: boolean;
  } | null>(null);
  const [trackerLog, setTrackerLog] = useState<TrackerLogEntry[]>(() => {
    if (!isSroci) return DEFAULT_TRACKER_LOG;
    return readPersistedSrociState(simStorageKey)?.trackerLog ?? DEFAULT_TRACKER_LOG;
  });

  useEffect(() => {
    setMode(initialMode);
    setTopic('All');
    setShowInteractiveSim(isSroci);
    setSrociSubView('cards');
    const firstForAccount = SCENARIOS.find(
      (s) => s.accountScope === (isSroci ? 'SROCI' : 'SPAVI')
    );
    if (firstForAccount) {
      setSelectedId(firstForAccount.id);
    }

    if (isSroci) {
      const saved = readPersistedSrociState(simStorageKey);
      setStageProgress(saved?.stageProgress ?? createInitialStageProgress());
      setPracticedIds(saved?.practicedIds ?? []);
      setNotesById(saved?.notesById ?? {});
      setTrackerLog(saved?.trackerLog ?? DEFAULT_TRACKER_LOG);
      setDynamicXp(saved?.dynamicXp ?? 0);
      setXpStreak(saved?.xpStreak ?? 0);
    }
  }, [isSroci, initialMode, simStorageKey]);

  useEffect(() => {
    if (!isSroci) return;
    try {
      const payload: PersistedSrociSimState = {
        stageProgress,
        practicedIds,
        notesById,
        trackerLog,
        dynamicXp,
        xpStreak,
      };
      window.localStorage.setItem(simStorageKey, JSON.stringify(payload));
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }, [
    isSroci,
    simStorageKey,
    stageProgress,
    practicedIds,
    notesById,
    trackerLog,
    dynamicXp,
    xpStreak,
  ]);

  useEffect(() => {
    if (!isSroci || !onTelemetryChange) return;

    const topicCounts = {
      'Ramp & Sourcing': 0,
      'Screening & Validation': 0,
      'Walk-In & Tracker': 0,
    };

    let completedStagesCount = 0;
    let stageAttemptsCount = 0;

    for (const stage of SROCI_PIPELINE_STAGES) {
      const state = stageProgress[stage.id];
      if (!state) continue;
      stageAttemptsCount += state.attempts;
      if (state.completed) {
        completedStagesCount += 1;
        if (stage.subView === 'ramp_post') {
          topicCounts['Ramp & Sourcing'] += 1;
        } else if (stage.subView === 'prescreen_validate') {
          topicCounts['Screening & Validation'] += 1;
        } else if (stage.subView === 'walkin_tracker') {
          topicCounts['Walk-In & Tracker'] += 1;
        }
      }
    }

    onTelemetryChange({
      completedStagesCount,
      totalStagesCount: SROCI_PIPELINE_STAGES.length,
      stageAttemptsCount,
      dynamicXp,
      xpStreak,
      topicCounts,
    });
  }, [isSroci, stageProgress, dynamicXp, xpStreak, onTelemetryChange]);

  const filteredScenarios = accountScenarios.filter((item) => {
    const matchesChannel = item.channel === mode;
    const matchesTopic = topic === 'All' || item.topic === topic;
    return matchesChannel && matchesTopic;
  });

  useEffect(() => {
    if (filteredScenarios.length > 0) {
      const stillVisible = filteredScenarios.some((s) => s.id === selectedId);
      if (!stillVisible) {
        setSelectedId(filteredScenarios[0].id);
      }
    }
  }, [mode, topic, filteredScenarios, selectedId]);

  const activeScenario =
    filteredScenarios.find((s) => s.id === selectedId) ??
    filteredScenarios[0] ??
    accountScenarios[0] ??
    SCENARIOS[0];

  const activeChatPrompt =
    CHAT_SIMULATION_PROMPTS.find((p) => p.id === selectedChatPromptId) ??
    CHAT_SIMULATION_PROMPTS[0];

  const isPracticed = practicedIds.includes(activeScenario.id);

  const togglePracticed = (id: string) => {
    setPracticedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeStageDef = useMemo(
    () =>
      SROCI_PIPELINE_STAGES.find((st) => st.id === activeStageId) ??
      SROCI_PIPELINE_STAGES[0],
    [activeStageId]
  );

  const completedStageCount = useMemo(
    () =>
      SROCI_PIPELINE_STAGES.filter((st) => stageProgress[st.id]?.completed).length,
    [stageProgress]
  );

  const completionPercent = Math.round(
    (completedStageCount / SROCI_PIPELINE_STAGES.length) * 100
  );

  const recruiterRank = useMemo(() => {
    if (dynamicXp >= 650) return 'SROCI Pipeline Master';
    if (dynamicXp >= 350) return 'Walk-In & Tracker Pro';
    if (dynamicXp >= 150) return 'Active Sourcer';
    return 'Onboarding Screener';
  }, [dynamicXp]);

  const handleSelectStageCard = (stage: SrociStageDefinition, openSubView = false) => {
    setActiveStageId(stage.id);
    setShowStageHint(false);
    setLastXpAward(null);
    if (openSubView) {
      setSrociSubView(stage.subView);
    }
  };

  const handlePlayStageOption = (
    stage: SrociStageDefinition,
    option: SrociStageDefinition['options'][number]
  ) => {
    const prevState = stageProgress[stage.id];
    const priorAttempts = prevState?.attempts ?? 0;
    const hintUsed = Boolean(prevState?.usedHint || showStageHint);

    let earned = 0;
    let breakdown: string[] = [];
    let nextStreak = xpStreak;

    if (option.isOptimal) {
      nextStreak = xpStreak + 1;
      const firstTryBonus = priorAttempts === 0 && !prevState?.completed ? 35 : 0;
      const noHintBonus = !hintUsed ? 20 : 0;
      const streakBonus = Math.min(nextStreak, 5) * 15;
      const replayFactor = prevState?.completed ? 0.5 : 1;
      const baseAward = Math.round(stage.baseXp * replayFactor);

      earned = baseAward + firstTryBonus + noHintBonus + streakBonus;
      breakdown = [
        prevState?.completed ? `+${baseAward} Replay` : `+${baseAward} Base`,
      ];
      if (firstTryBonus > 0) breakdown.push(`+${firstTryBonus} First-Try`);
      if (noHintBonus > 0) breakdown.push(`+${noHintBonus} No-Hint`);
      if (streakBonus > 0) breakdown.push(`+${streakBonus} ${nextStreak}x Streak`);
    } else {
      nextStreak = 0;
      earned = 15;
      breakdown = ['+15 Drill Attempt'];
    }

    setXpStreak(nextStreak);
    setDynamicXp((prev) => prev + earned);
    setLastXpAward({
      total: earned,
      breakdown,
      feedback: option.coaching,
      isOptimal: option.isOptimal,
    });

    setStageProgress((prev) => ({
      ...prev,
      [stage.id]: {
        completed: option.isOptimal ? true : prev[stage.id].completed,
        attempts: priorAttempts + 1,
        usedHint: hintUsed,
        xpEarned: (prev[stage.id]?.xpEarned ?? 0) + earned,
        statusNote: option.outcomeLabel,
      },
    }));

    if (option.isOptimal && !practicedIds.includes(activeScenario.id)) {
      setPracticedIds((prev) => [...prev, activeScenario.id]);
    }
  };

  const handleUpdateTrackerOutcome = (
    candidate: string,
    status: TrackerLogEntry['status']
  ) => {
    const bonus = status === 'Hired' ? 45 : status === 'Passed' ? 30 : 25;
    setDynamicXp((prev) => prev + bonus);
    setLastXpAward({
      total: bonus,
      breakdown: [`+${bonus} Tracker Sync`],
      feedback: `Updated ${candidate} to "${status}" in the shared tracker and synced follow-up progress.`,
      isOptimal: true,
    });
    setTrackerLog((prev) => [
      {
        candidate,
        stage:
          status === 'Hired' || status === 'Passed' || status === 'Failed'
            ? 'Status Follow-Up'
            : 'Client Tracker',
        status,
        updatedBy: 'You (Live)',
      },
      ...prev.slice(0, 5),
    ]);
  };

  const handleResetSrociProgress = () => {
    const freshStages = createInitialStageProgress();
    setStageProgress(freshStages);
    setPracticedIds([]);
    setNotesById({});
    setTrackerLog(DEFAULT_TRACKER_LOG);
    setDynamicXp(0);
    setXpStreak(0);
    setLastXpAward(null);
    setShowStageHint(false);
    setActiveStageId('ramp_check');
    setSrociSubView('cards');
    try {
      window.localStorage.removeItem(simStorageKey);
    } catch {
      // Ignore storage errors
    }
  };

  const visibleSubViewStages = useMemo(() => {
    if (srociSubView === 'ramp_post') {
      return SROCI_PIPELINE_STAGES.filter((s) => s.subView === 'ramp_post');
    }
    if (srociSubView === 'prescreen_validate') {
      return SROCI_PIPELINE_STAGES.filter((s) => s.subView === 'prescreen_validate');
    }
    if (srociSubView === 'walkin_tracker') {
      return SROCI_PIPELINE_STAGES.filter((s) => s.subView === 'walkin_tracker');
    }
    return SROCI_PIPELINE_STAGES;
  }, [srociSubView]);

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSroci ? 'SROCI Recruitment Simulations' : 'Simulations'}
          </h1>
          <p className="text-sm text-slate-600">
            {normalizedAccount} •{' '}
            {isSroci
              ? 'Ramp Check, Job Posting, Prescreening, Validation, Walk-In & Client Tracker across Voice, Chat, and Email'
              : 'Voice, Chat, or Email practice • Self-paced proficiency (no grading)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSroci && (
            <button
              type="button"
              onClick={() => setShowInteractiveSim((prev) => !prev)}
              className="sroci-alive-btn rounded-xl bg-[#7e4cf6] px-3.5 py-1.5 text-xs font-semibold text-white border border-white/30 hover:bg-[#6b3be0] transition cursor-pointer"
            >
              {showInteractiveSim ? 'Hide Pipeline Quest' : 'Launch Pipeline Quest'}
            </button>
          )}
          <div className="glass-card px-4 py-1.5 text-xs font-semibold text-purple-950">
            Practiced this session: {practicedIds.length} / {accountScenarios.length}
          </div>
        </div>
      </div>

      {isSroci && (
        <div className="glass-card sroci-liquid-elevated sroci-fade-panel p-4 md:p-6 space-y-5 rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/65 pb-4">
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#7e4cf6]/15 border border-white/80 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#6b3be0]">
                  Interactive Pipeline Cards
                </span>
                <span className="rounded-full bg-white/80 border border-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  {recruiterRank}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {completedStageCount}/{SROCI_PIPELINE_STAGES.length} Stages ({completionPercent}%)
                </span>
              </div>

              <div className="h-2.5 w-full max-w-md rounded-full bg-white/65 border border-white/85 overflow-hidden">
                <div
                  style={{ width: `${completionPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#6b3be0] via-[#7e4cf6] to-[#38bdf8] transition-all duration-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="sroci-light-edge rounded-2xl bg-white/75 px-3.5 py-2 text-center">
                <div className="text-[10px] font-semibold uppercase text-slate-500">
                  Dynamic XP
                </div>
                <div className="text-sm font-bold text-[#7e4cf6]">{dynamicXp} XP</div>
              </div>
              <div className="sroci-light-edge rounded-2xl bg-white/75 px-3.5 py-2 text-center">
                <div className="text-[10px] font-semibold uppercase text-slate-500">
                  Streak
                </div>
                <div className="text-sm font-bold text-amber-700">
                  {xpStreak > 0 ? `🔥 ${xpStreak}x` : '0x'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetSrociProgress}
                className="sroci-alive-btn glass-btn rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Reset Progress
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'cards', label: 'All Stage Cards (7)' },
                  { id: 'ramp_post', label: '1. Ramp & Job Post Activity' },
                  { id: 'prescreen_validate', label: '2. Prescreen & Validate Activity' },
                  { id: 'walkin_tracker', label: '3. Walk-In & Tracker Follow-Up' },
                ] as { id: SrociSubView; label: string }[]
              ).map((tab) => {
                const active = srociSubView === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSrociSubView(tab.id);
                      setShowStageHint(false);
                      setLastXpAward(null);
                      const matching = SROCI_PIPELINE_STAGES.find((s) => s.subView === tab.id);
                      if (matching) setActiveStageId(matching.id);
                    }}
                    className={`sroci-alive-btn rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      active
                        ? 'bg-[#7e4cf6] text-white border border-white/45 shadow-sm'
                        : 'glass-btn text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {visibleSubViewStages.map((stage) => {
              const prog = stageProgress[stage.id];
              const isSelected = stage.id === activeStageId;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleSelectStageCard(stage, false)}
                  className={`sroci-alive-btn sroci-light-edge text-left rounded-2xl p-3 flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-white/95 border-[#7e4cf6] ring-2 ring-[#7e4cf6]/30 -translate-y-1'
                      : prog?.completed
                      ? 'bg-emerald-50/75 border-emerald-400/70'
                      : 'bg-white/55 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                    <span className="text-[#6b3be0]">STEP {stage.stepNumber}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 ${
                        prog?.completed
                          ? 'bg-emerald-500/20 text-emerald-900'
                          : 'bg-white/80 text-slate-600'
                      }`}
                    >
                      {prog?.completed ? '✓ Done' : `+${stage.baseXp} XP`}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {stage.title}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                      {prog?.statusNote ?? stage.badge}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="sroci-light-edge lg:col-span-7 rounded-2xl bg-white/60 p-4 md:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b3be0]">
                    Step {activeStageDef.stepNumber} of 7 • {activeStageDef.badge}
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    {activeStageDef.title} — Interactive Challenge
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowStageHint((prev) => !prev);
                    setStageProgress((prev) => ({
                      ...prev,
                      [activeStageDef.id]: {
                        ...prev[activeStageDef.id],
                        usedHint: true,
                      },
                    }));
                  }}
                  className="sroci-alive-btn glass-btn rounded-xl px-3 py-1 text-xs font-semibold text-[#6b3be0] cursor-pointer"
                >
                  {showStageHint ? 'Hide Hint' : 'Hint (-20 No-Hint Bonus)'}
                </button>
              </div>

              <p className="text-xs md:text-sm text-slate-800 bg-white/80 border border-white rounded-xl p-3.5">
                {activeStageDef.promptQuestion}
              </p>

              {showStageHint && (
                <div className="sroci-fade-panel rounded-xl bg-purple-50/90 border border-white px-3.5 py-2.5 text-xs text-purple-950">
                  <strong>Recruiter Tip:</strong> {activeStageDef.hint}
                </div>
              )}

              <div className="space-y-2.5">
                {activeStageDef.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePlayStageOption(activeStageDef, opt)}
                    className="sroci-alive-btn w-full text-left rounded-2xl bg-white/85 hover:bg-white border border-white hover:border-[#7e4cf6]/70 p-3.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs md:text-sm font-semibold text-slate-900">
                        {opt.label}
                      </span>
                      <span className="shrink-0 rounded-full bg-[#7e4cf6]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#6b3be0]">
                        {opt.isOptimal ? `Up to +${activeStageDef.baseXp + 70} XP` : '+15 XP'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{opt.detail}</div>
                  </button>
                ))}
              </div>

              {lastXpAward && (
                <div
                  className={`sroci-fade-panel rounded-2xl border p-3.5 space-y-1.5 ${
                    lastXpAward.isOptimal
                      ? 'bg-emerald-50/90 border-emerald-400/80 text-emerald-950'
                      : 'bg-amber-50/90 border-amber-400/80 text-amber-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold">
                      {lastXpAward.isOptimal ? 'XP Boosted!' : 'Practice Logged'} (+{lastXpAward.total} XP)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {lastXpAward.breakdown.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-[#6b3be0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs">{lastXpAward.feedback}</p>
                </div>
              )}
            </div>

            <div className="sroci-light-edge lg:col-span-5 rounded-2xl bg-white/60 p-4 md:p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b3be0]">
                    Shared Client Tracker &amp; Follow-Up
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Test Status Updates (Passed / Failed / Hired)
                  </h3>
                </div>
                <span className="rounded-full bg-white/85 border border-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                  Live Sandbox
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['Endorsed', 'Walk-In Scheduled', 'Passed', 'Failed', 'Hired'] as const).map(
                  (statusOpt) => (
                    <button
                      key={statusOpt}
                      type="button"
                      onClick={() => handleUpdateTrackerOutcome('Candidate #408', statusOpt)}
                      className="sroci-alive-btn glass-btn rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-800 cursor-pointer"
                    >
                      Mark {statusOpt}
                    </button>
                  )
                )}
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                {trackerLog.map((row, index) => (
                  <div
                    key={`${row.candidate}-${row.status}-${index}`}
                    className="sroci-fade-panel rounded-xl bg-white/85 border border-white px-3 py-2 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {row.candidate} • <span className="font-normal text-slate-600">{row.stage}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{row.updatedBy}</div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        row.status === 'Hired'
                          ? 'bg-emerald-500/20 text-emerald-900'
                          : row.status === 'Passed'
                          ? 'bg-sky-500/20 text-sky-900'
                          : row.status === 'Failed'
                          ? 'bg-rose-500/20 text-rose-900'
                          : 'bg-[#7e4cf6]/15 text-[#6b3be0]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {showInteractiveSim && (
            <div className="pt-1">
              <SrociRecruitmentSimBox
                lob={mode}
                onCompleteSession={(summary) => {
                  setDynamicXp((prev) => prev + summary.xpEarned);
                  if (!practicedIds.includes(activeScenario.id)) {
                    setPracticedIds((prev) => [...prev, activeScenario.id]);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 mr-1">Mode:</span>
          {(['Voice', 'Chat', 'Email'] as ChannelMode[]).map((channel) => {
            const active = mode === channel;
            return (
              <button
                key={channel}
                type="button"
                onClick={() => setMode(channel)}
                className={`sroci-alive-btn rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                  active
                    ? 'bg-[#7e4cf6] text-white border border-white/40 ring-2 ring-[#7e4cf6]/30 shadow-sm'
                    : 'glass-btn text-slate-800'
                }`}
              >
                {channel}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {availableTopics.map((item) => {
            const active = topic === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={`sroci-alive-btn rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                  active
                    ? 'bg-[#0e0a24] text-white border border-white/30 shadow-sm'
                    : 'glass-btn text-slate-700'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 space-y-3">
          {filteredScenarios.length === 0 ? (
            <div className="glass-card p-5 text-sm text-slate-700">
              No scenarios match this filter combination. Try switching to All topics.
            </div>
          ) : (
            filteredScenarios.map((item) => {
              const selected = item.id === activeScenario.id;
              const done = practicedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`sroci-alive-btn w-full text-left rounded-[18px] border p-4 backdrop-blur-[26px] transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                    selected
                      ? 'bg-white/55 border-[#7e4cf6]/75 ring-2 ring-[#7e4cf6]/30 shadow-[0_14px_38px_rgba(126,76,246,0.16)]'
                      : 'bg-white/25 border-white/85 hover:bg-white/45 hover:border-[#7e4cf6]/50 hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(15,23,42,0.08)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span className="rounded-lg bg-purple-500/15 border border-white/70 px-2 py-0.5 font-medium text-purple-950">
                      {item.channel} • {item.topic}
                    </span>
                    <span className="text-slate-600">~{item.estimatedMinutes} min</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-900">
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={done ? 'text-emerald-800 font-semibold' : 'text-slate-600'}>
                      {done ? 'Practiced ✓' : 'Ready to practice'}
                    </span>
                    <span className="font-semibold text-[#6b3be0]">Open →</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-8 glass-card p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#6b3be0]">
                {activeScenario.channel} • {activeScenario.topic} • ~{activeScenario.estimatedMinutes} Min Practice
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {activeScenario.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => togglePracticed(activeScenario.id)}
              className={`sroci-alive-btn rounded-xl px-4 py-2 text-xs font-semibold border transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97] active:ring-2 cursor-pointer ${
                isPracticed
                  ? 'bg-emerald-600 text-white border-white/35 active:ring-emerald-400/40'
                  : 'bg-[#7e4cf6] text-white border-white/35 active:ring-[#7e4cf6]/40'
              }`}
            >
              {isPracticed ? 'Marked as Practiced ✓' : 'Mark as Practiced'}
            </button>
          </div>

          <div className="glass-card p-4">
            <div className="text-xs font-semibold text-slate-800 mb-1">
              Scenario Situation
            </div>
            <p className="text-sm text-slate-700">{activeScenario.situation}</p>
          </div>

          {!isSroci && mode === 'Chat' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Chat Prompt:
                </span>
                {CHAT_SIMULATION_PROMPTS.map((item) => {
                  const isSelected = item.id === activeChatPrompt.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedChatPromptId(item.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                        isSelected
                          ? 'bg-[#7e4cf6] text-white border border-white/40 ring-2 ring-[#7e4cf6]/30 shadow-sm'
                          : 'glass-btn text-slate-800'
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>

              <ChatPracticeBox
                prompt={activeChatPrompt}
                accountName={normalizedAccount}
              />
            </div>
          )}

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-2">
              Suggested Response Flow
            </div>
            <ol className="space-y-2">
              {activeScenario.responseFlow.map((step, idx) => (
                <li key={step} className="flex items-start gap-2.5 text-sm text-slate-800">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/75 border border-white text-[11px] font-bold text-purple-950">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-2">
              Helpful {activeScenario.channel} Reminders
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {activeScenario.reminders.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div>
            <label
              htmlFor="practice-notes"
              className="block text-xs font-semibold text-slate-800 mb-1.5"
            >
              Personal Practice Notes (Optional)
            </label>
            <textarea
              id="practice-notes"
              rows={3}
              value={notesById[activeScenario.id] ?? ''}
              onChange={(e) =>
                setNotesById((prev) => ({
                  ...prev,
                  [activeScenario.id]: e.target.value,
                }))
              }
              placeholder={
                isSroci
                  ? 'Draft prescreen questions, walk-in invite details, or tracker follow-up notes...'
                  : 'Draft a sample response or note phrasing you want to remember...'
              }
              className="glass-card w-full p-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#7e4cf6] focus:bg-white/65 focus:outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}