import React, { useMemo, useState } from 'react';

export type RecruitmentChannel = 'Voice' | 'Chat' | 'Email';

export type PipelineStageKey =
  | 'ramp_job_post'
  | 'prescreening'
  | 'profile_validation'
  | 'walk_in_invite'
  | 'client_tracker'
  | 'status_followup';

export interface SimChoice {
  id: string;
  label: string;
  sublabel?: string;
  isOptimal: boolean;
  xpDelta: number;
  feedback: string;
  trackerStatusUpdate?: 'Endorsed' | 'Walk-In Scheduled' | 'Passed' | 'Failed' | 'Hired';
}

export interface RecruitmentScenarioTurn {
  id: string;
  stage: PipelineStageKey;
  stageTitle: string;
  channel: RecruitmentChannel;
  candidateName: string;
  roleTitle: string;
  contextBrief: string;
  incomingMessage: string;
  senderLabel: string;
  quickHints: string[];
  choices: SimChoice[];
}

interface SrociRecruitmentSimBoxProps {
  lob?: 'Voice' | 'Chat' | 'Email';
  onCompleteSession?: (summary: {
    xpEarned: number;
    maxStreak: number;
    correctCount: number;
    totalTurns: number;
    channel: RecruitmentChannel;
  }) => void;
}

const PIPELINE_STEPS: { key: PipelineStageKey; label: string }[] = [
  { key: 'ramp_job_post', label: '1. Ramp & Post' },
  { key: 'prescreening', label: '2. Prescreen' },
  { key: 'profile_validation', label: '3. Validate' },
  { key: 'walk_in_invite', label: '4. Walk-In' },
  { key: 'client_tracker', label: '5. Tracker' },
  { key: 'status_followup', label: '6. Follow-Up' },
];

const SCENARIO_BANK: RecruitmentScenarioTurn[] = [
  {
    id: 'sroci-1-ramp',
    stage: 'ramp_job_post',
    stageTitle: 'Client Ramp Check & Job Posting',
    channel: 'Email',
    candidateName: 'Ramp Brief #SR-204',
    roleTitle: 'Customer / Applicant Sourcing Specialist',
    contextBrief:
      'Client sent an urgent ramp update for 25 seats starting Monday, listing "Night Shift (10 PM – 7 AM)" in the subject line but "Day Shift / Flexible" in the body, with no site address.',
    incomingMessage:
      'Hi SROCI team—please post this hiring call right away and start screening! Let us know once live.',
    senderLabel: 'Client Operations Lead',
    quickHints: [
      'Verify shift schedule, site location, and salary/perk accuracy before posting.',
      'Avoid publishing conflicting shift details that cause walk-in no-shows.',
    ],
    choices: [
      {
        id: 'a',
        label: 'Clarify the shift & walk-in site details first, then publish a clean job post',
        sublabel: 'Prevents misaligned applicants and walk-in drop-offs',
        isOptimal: true,
        xpDelta: 120,
        feedback:
          'Nice catch! Aligning the ramp details first keeps job ads accurate and protects your prescreen-to-walk-in conversion.',
      },
      {
        id: 'b',
        label: 'Post immediately using the subject line only and fix details later',
        sublabel: 'Fast publish without verifying ramp discrepancies',
        isOptimal: false,
        xpDelta: 25,
        feedback:
          'Posting with conflicting ramp info creates confusion during prescreening and lowers walk-in show rates.',
      },
      {
        id: 'c',
        label: 'Skip the job post and pull old applicants from last quarter',
        sublabel: 'No active job posting published',
        isOptimal: false,
        xpDelta: 15,
        feedback:
          'Always confirm and publish the updated job post aligned to the active client ramp so sourcing stays traceable.',
      },
    ],
  },
  {
    id: 'sroci-2-prescreen',
    stage: 'prescreening',
    stageTitle: 'Prescreening Call / Chat',
    channel: 'Voice',
    candidateName: 'Marco Reyes',
    roleTitle: 'Voice / Applicant Support Associate',
    contextBrief:
      'Live prescreening call. Ramp requires willingness to report on-site in Pasig/Ortigas for walk-in assessment and night-shift readiness.',
    incomingMessage:
      '"I’m interested in the opening! Though I can only do remote work and have a family errand every Tuesday morning until 11 AM."',
    senderLabel: 'Marco Reyes (Applicant)',
    quickHints: [
      'Check site walk-in readiness and shift/schedule alignment early.',
      'Be polite, clear, and firm on non-negotiable ramp requirements.',
    ],
    choices: [
      {
        id: 'a',
        label: 'Confirm site/shift non-negotiables clearly; politely disposition if unmatched',
        sublabel: 'Saves screening time and keeps pipeline quality high',
        isOptimal: true,
        xpDelta: 130,
        feedback:
          'Spot on! Confirming on-site and schedule fit early prevents wasting walk-in slots on mismatched availability.',
      },
      {
        id: 'b',
        label: 'Book him for a site walk-in anyway and hope he changes his mind',
        sublabel: 'Invite despite stated remote-only preference',
        isOptimal: false,
        xpDelta: 20,
        feedback:
          'Inviting applicants who explicitly state they cannot meet site/shift terms inflates no-shows.',
      },
      {
        id: 'c',
        label: 'End the call abruptly without explaining why he didn’t qualify',
        sublabel: 'Abrupt hang-up',
        isOptimal: false,
        xpDelta: 10,
        feedback:
          'Keep candidate experience respectful—briefly explain the role/site requirement before closing.',
      },
    ],
  },
  {
    id: 'sroci-3-validate',
    stage: 'profile_validation',
    stageTitle: 'Candidate Profile Validation',
    channel: 'Chat',
    candidateName: 'Alyssa Mendoza',
    roleTitle: 'Recruitment & Screening Associate',
    contextBrief:
      'Alyssa passed prescreening. During profile validation, you notice her resume lists two different phone numbers, an unverified graduation year, and a 30-day notice period.',
    incomingMessage:
      'Chat note from Alyssa: "Ready for walk-in tomorrow! Btw my current job might need 2–3 weeks notice if selected."',
    senderLabel: 'Alyssa Mendoza (Passed Prescreen)',
    quickHints: [
      'Validate contact info, availability/notice period, and required documents.',
      'Flag notice period or missing details clearly so client expectations stay realistic.',
    ],
    choices: [
      {
        id: 'a',
        label: 'Confirm her primary contact & exact notice window, then validate profile notes',
        sublabel: 'Complete, accurate candidate profile before inviting',
        isOptimal: true,
        xpDelta: 125,
        feedback:
          'Great validation habit! Verifying contact details and notice period upfront avoids surprises after endorsement.',
      },
      {
        id: 'b',
        label: 'Mark profile as "Immediate Start" without asking about her notice period',
        sublabel: 'Assumes immediate availability',
        isOptimal: false,
        xpDelta: 20,
        feedback:
          'Never guess start availability—accurate profile validation protects trust with the client.',
      },
      {
        id: 'c',
        label: 'Reject her profile over a minor formatting detail on her resume',
        sublabel: 'Over-filtering a qualified candidate',
        isOptimal: false,
        xpDelta: 30,
        feedback:
          'Focus validation on eligibility, accuracy, and readiness rather than minor resume styling.',
      },
    ],
  },
  {
    id: 'sroci-4-walkin',
    stage: 'walk_in_invite',
    stageTitle: 'Site Walk-In Invitation',
    channel: 'Email',
    candidateName: 'Daniel Cruz',
    roleTitle: 'Customer & Applicant Specialist',
    contextBrief:
      'Daniel passed prescreening and profile validation. You are sending his walk-in invite for tomorrow at 10:00 AM.',
    incomingMessage:
      'Draft check: Candidate asked what to bring and how to find the recruitment hub.',
    senderLabel: 'Walk-In Scheduling Queue',
    quickHints: [
      'Include exact date, reporting time, site address/landmarks, valid ID, and updated CV.',
      'Ask for a quick confirmation reply so walk-in attendance is predictable.',
    ],
    choices: [
      {
        id: 'a',
        label: 'Send clear invite with time, site location, required ID/CV, and reply confirmation',
        sublabel: 'High-clarity walk-in invite',
        isOptimal: true,
        xpDelta: 135,
        feedback:
          'Clean invite! Giving clear logistics + ID/CV reminders + confirmation ask boosts walk-in show-up rates.',
      },
      {
        id: 'b',
        label: 'Send "Come tomorrow morning" with no address, time, or what to bring',
        sublabel: 'Vague invite missing key details',
        isOptimal: false,
        xpDelta: 15,
        feedback:
          'Missing time, site details, or ID reminders is one of the top causes of walk-in no-shows.',
      },
      {
        id: 'c',
        label: 'Wait until 9:45 AM tomorrow to send the invite',
        sublabel: 'Last-minute notice',
        isOptimal: false,
        xpDelta: 25,
        feedback:
          'Sending walk-in details early gives candidates time to plan travel and confirm attendance.',
      },
    ],
  },
  {
    id: 'sroci-5-tracker',
    stage: 'client_tracker',
    stageTitle: 'Shared Client Tracker Endorsement',
    channel: 'Chat',
    candidateName: 'Hannah Lim',
    roleTitle: 'Screening & Sourcing Specialist',
    contextBrief:
      'Hannah completed her site walk-in and passed initial assessment. You need to endorse her into the shared client tracker.',
    incomingMessage:
      'Tracker reminder: Ensure candidate name, contact, endorsement date, sourcing channel, and status are accurate.',
    senderLabel: 'Shared Client Tracker',
    quickHints: [
      'Keep the shared client tracker accurate, complete, and up to date.',
      'Double-check spelling, contact info, and endorsement status before saving.',
    ],
    choices: [
      {
        id: 'a',
        label: 'Log complete, accurate details & set status to "Endorsed" in the shared tracker',
        sublabel: 'Zero-gap tracker entry',
        isOptimal: true,
        xpDelta: 140,
        trackerStatusUpdate: 'Endorsed',
        feedback:
          'Zero-Gap Endorser! Accurate tracker entries keep recruiter and client counts aligned with zero reconciliation headaches.',
      },
      {
        id: 'b',
        label: 'Leave status blank and tell the client "I sent her over somewhere"',
        sublabel: 'Incomplete tracker update',
        isOptimal: false,
        xpDelta: 20,
        feedback:
          'Unrecorded or partial tracker rows make it hard to track candidate progress and SLA turnaround.',
      },
      {
        id: 'c',
        label: 'Overwrite another candidate’s row to save time',
        sublabel: 'Corrupts existing tracker record',
        isOptimal: false,
        xpDelta: 0,
        feedback:
          'Never overwrite existing rows—always add a clean entry so historical tracking stays intact.',
      },
    ],
  },
  {
    id: 'sroci-6-followup',
    stage: 'status_followup',
    stageTitle: 'Status Follow-Up (Passed / Failed / Hired)',
    channel: 'Voice',
    candidateName: 'Hannah Lim',
    roleTitle: 'Screening & Sourcing Specialist',
    contextBrief:
      'Client updates the shared tracker: Hannah is marked HIRED for Monday’s onboarding batch, while another applicant from the batch was marked FAILED.',
    incomingMessage:
      'Client feedback posted: "Hannah Lim — HIRED (Start Monday). Please confirm onboarding readiness and update tracker."',
    senderLabel: 'Client Hiring Manager',
    quickHints: [
      'Update and confirm Hired / Passed / Failed statuses consistently in the tracker.',
      'Congratulate and align next steps for Hired candidates; close out Failed ones courteously.',
    ],
    choices: [
      {
        id: 'a',
        label: 'Confirm "Hired" in tracker, align onboarding next steps with Hannah, and close out failed status cleanly',
        sublabel: 'Full-cycle follow-up & tracker closure',
        isOptimal: true,
        xpDelta: 150,
        trackerStatusUpdate: 'Hired',
        feedback:
          'Full-cycle win! Confirming Hired status, guiding onboarding readiness, and keeping Pass/Fail tracking clean closes the loop.',
      },
      {
        id: 'b',
        label: 'Leave tracker on "Endorsed" and do no follow-up with the hired candidate',
        sublabel: 'Stale tracker status & no candidate follow-up',
        isOptimal: false,
        xpDelta: 25,
        feedback:
          'Following up on Hired, Passed, and Failed outcomes keeps both the candidate and the client tracker aligned.',
      },
      {
        id: 'c',
        label: 'Mark a failed candidate as "Hired" to boost numbers',
        sublabel: 'Inaccurate status reporting',
        isOptimal: false,
        xpDelta: 0,
        feedback:
          'Status integrity is critical—always reflect true client outcomes (Passed, Failed, or Hired).',
      },
    ],
  },
];

export const SrociRecruitmentSimBox: React.FC<SrociRecruitmentSimBoxProps> = ({
  lob = 'Chat',
  onCompleteSession,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<RecruitmentChannel>(lob);
  const [turnIndex, setTurnIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [trackerStatus, setTrackerStatus] = useState<
    'Pending Prescreen' | 'Walk-In Scheduled' | 'Endorsed' | 'Passed' | 'Failed' | 'Hired'
  >('Pending Prescreen');
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [chatLog, setChatLog] = useState<
    { id: string; sender: string; text: string; tone?: 'incoming' | 'action' | 'coach' }[]
  >(() => {
    const first = SCENARIO_BANK[0];
    return [
      {
        id: 'init-1',
        sender: first.senderLabel,
        text: first.incomingMessage,
        tone: 'incoming',
      },
    ];
  });

  const currentTurn = SCENARIO_BANK[turnIndex];

  const activeChoice = useMemo(
    () => currentTurn?.choices.find((c) => c.id === selectedChoiceId) ?? null,
    [currentTurn, selectedChoiceId]
  );

  const rankTitle = useMemo(() => {
    if (xp >= 650) return 'SROCI Pipeline Master';
    if (xp >= 400) return 'Walk-In & Tracker Pro';
    if (xp >= 200) return 'Rising Sourcer';
    return 'Rookie Screener';
  }, [xp]);

  const handleChannelSwitch = (ch: RecruitmentChannel) => {
    setSelectedChannel(ch);
  };

  const handleSelectChoice = (choice: SimChoice) => {
    if (selectedChoiceId || finished) return;
    setSelectedChoiceId(choice.id);

    const nextStreak = choice.isOptimal ? streak + 1 : 0;
    const streakBonus = choice.isOptimal && nextStreak > 1 ? (nextStreak - 1) * 20 : 0;
    const totalGain = choice.xpDelta + streakBonus;

    setXp((prev) => prev + totalGain);
    setStreak(nextStreak);
    setBestStreak((prev) => Math.max(prev, nextStreak));
    if (choice.isOptimal) {
      setCorrectCount((prev) => prev + 1);
    }
    if (choice.trackerStatusUpdate) {
      setTrackerStatus(choice.trackerStatusUpdate);
    }

    setChatLog((prev) => [
      ...prev,
      {
        id: `${currentTurn.id}-act-${Date.now()}`,
        sender: `You (${selectedChannel})`,
        text: choice.label,
        tone: 'action',
      },
      {
        id: `${currentTurn.id}-coach-${Date.now() + 1}`,
        sender: choice.isOptimal ? `Pipeline Coach (+${totalGain} XP)` : `Pipeline Coach (+${totalGain} XP)`,
        text: choice.feedback,
        tone: 'coach',
      },
    ]);
  };

  const handleNextStage = () => {
    if (turnIndex + 1 < SCENARIO_BANK.length) {
      const nextIdx = turnIndex + 1;
      const nextTurn = SCENARIO_BANK[nextIdx];
      setTurnIndex(nextIdx);
      setSelectedChoiceId(null);
      setShowHint(false);
      setChatLog((prev) => [
        ...prev,
        {
          id: `${nextTurn.id}-in-${Date.now()}`,
          sender: nextTurn.senderLabel,
          text: nextTurn.incomingMessage,
          tone: 'incoming',
        },
      ]);
    } else {
      setFinished(true);
      onCompleteSession?.({
        xpEarned: xp,
        maxStreak: bestStreak,
        correctCount,
        totalTurns: SCENARIO_BANK.length,
        channel: selectedChannel,
      });
    }
  };

  const handleRestart = () => {
    const first = SCENARIO_BANK[0];
    setTurnIndex(0);
    setXp(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setSelectedChoiceId(null);
    setTrackerStatus('Pending Prescreen');
    setShowHint(false);
    setFinished(false);
    setChatLog([
      {
        id: `restart-1-${Date.now()}`,
        sender: first.senderLabel,
        text: first.incomingMessage,
        tone: 'incoming',
      },
    ]);
  };

  return (
    <div className="glass-card p-4 md:p-6 space-y-5 rounded-3xl">
      {/* Top Gamified HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300/40 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#7e4cf6]/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#6b3be0]">
              SROCI Recruitment Sim
            </span>
            <span className="rounded-full bg-white/80 border border-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
              Rank: {rankTitle}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900">
              Tracker: {trackerStatus}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1.5">
            End-to-End Recruitment Pipeline Quest
          </h2>
          <p className="text-xs text-slate-600">
            Ramp Check &amp; Job Post → Prescreening → Profile Validation → Walk-In Invite → Client Tracker → Status Follow-Up
          </p>
        </div>

        {/* XP & Streak Counters + Channel Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-2xl bg-white/75 border border-white px-3.5 py-2 text-center">
            <div className="text-[10px] font-semibold uppercase text-slate-500">XP</div>
            <div className="text-sm font-bold text-[#7e4cf6]">{xp}</div>
          </div>
          <div className="rounded-2xl bg-white/75 border border-white px-3.5 py-2 text-center">
            <div className="text-[10px] font-semibold uppercase text-slate-500">Streak</div>
            <div className="text-sm font-bold text-amber-700">
              {streak > 0 ? `🔥 ${streak}x` : '0x'}
            </div>
          </div>

          <div className="flex rounded-xl bg-white/60 p-1 border border-white/80">
            {(['Voice', 'Chat', 'Email'] as RecruitmentChannel[]).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => handleChannelSwitch(ch)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedChannel === ch
                    ? 'bg-[#7e4cf6] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/70'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Stage Pipeline Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCurrent = !finished && idx === turnIndex;
          const isDone = finished || idx < turnIndex;
          return (
            <div
              key={step.key}
              className={`rounded-xl px-3 py-2 text-[11px] font-semibold border transition-all ${
                isCurrent
                  ? 'bg-white/90 border-[#7e4cf6] text-[#6b3be0] ring-2 ring-[#7e4cf6]/20'
                  : isDone
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-950'
                  : 'bg-white/45 border-white/70 text-slate-600'
              }`}
            >
              {isDone ? '✓ ' : ''}
              {step.label}
            </div>
          );
        })}
      </div>

      {!finished && currentTurn ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Live Chat / Case Feed */}
          <div className="lg:col-span-5 rounded-2xl bg-white/55 border border-white/85 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {currentTurn.stageTitle}
                </span>
                <span className="rounded-full bg-[#7e4cf6]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#6b3be0]">
                  {selectedChannel} Practice
                </span>
              </div>
              <div className="text-[11px] text-slate-700 bg-white/70 rounded-xl p-2.5 border border-white">
                <span className="font-semibold text-slate-900">
                  {currentTurn.candidateName}
                </span>{' '}
                • {currentTurn.roleTitle}
                <p className="mt-1 text-slate-600">{currentTurn.contextBrief}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {chatLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-2.5 text-xs ${
                    msg.tone === 'action'
                      ? 'bg-[#7e4cf6] text-white ml-6'
                      : msg.tone === 'coach'
                      ? 'bg-amber-50/95 border border-amber-200 text-slate-800'
                      : 'bg-white/90 border border-white text-slate-800 mr-4'
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold mb-0.5 ${
                      msg.tone === 'action' ? 'text-purple-100' : 'text-slate-500'
                    }`}
                  >
                    {msg.sender}
                  </div>
                  <div className="leading-relaxed">{msg.text}</div>
                </div>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="text-xs font-semibold text-[#6b3be0] hover:underline cursor-pointer"
              >
                {showHint ? 'Hide Recruiter Tip' : 'Need a Recruiter Tip?'}
              </button>
              <span className="text-[11px] text-slate-500">
                Stage {turnIndex + 1} of {SCENARIO_BANK.length}
              </span>
            </div>

            {showHint && (
              <ul className="rounded-xl bg-purple-50/90 border border-purple-200 p-2.5 text-[11px] text-purple-950 space-y-1 list-disc pl-4">
                {currentTurn.quickHints.map((hint, i) => (
                  <li key={i}>{hint}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: Interactive Decision Choices */}
          <div className="lg:col-span-7 rounded-2xl bg-white/60 border border-white/85 p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Choose Your Next Recruiter Action
              </div>

              <div className="space-y-2.5">
                {currentTurn.choices.map((choice) => {
                  const isPicked = selectedChoiceId === choice.id;
                  const showResult = Boolean(selectedChoiceId);

                  let cardStyle =
                    'bg-white/85 border-white hover:border-[#7e4cf6]/70 hover:bg-white';
                  if (showResult && isPicked) {
                    cardStyle = choice.isOptimal
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20';
                  } else if (showResult && choice.isOptimal) {
                    cardStyle = 'bg-emerald-50/70 border-emerald-400/70';
                  }

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={Boolean(selectedChoiceId)}
                      onClick={() => handleSelectChoice(choice)}
                      className={`w-full text-left rounded-2xl border p-3.5 transition-all cursor-pointer disabled:cursor-default ${cardStyle}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs md:text-sm font-semibold text-slate-900">
                          {choice.label}
                        </span>
                        <span className="shrink-0 rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-bold text-[#6b3be0]">
                          +{choice.xpDelta} XP
                        </span>
                      </div>
                      {choice.sublabel && (
                        <div className="text-[11px] text-slate-600 mt-1">
                          {choice.sublabel}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeChoice && (
              <div className="rounded-2xl bg-white/90 border border-white p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-800 max-w-xl">
                  <span
                    className={`font-bold mr-1.5 ${
                      activeChoice.isOptimal ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {activeChoice.isOptimal ? 'Optimal Move:' : 'Coaching Note:'}
                  </span>
                  {activeChoice.feedback}
                </div>

                <button
                  type="button"
                  onClick={handleNextStage}
                  className="rounded-xl bg-[#7e4cf6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6b3be0] transition-all cursor-pointer"
                >
                  {turnIndex + 1 < SCENARIO_BANK.length
                    ? 'Next Pipeline Stage →'
                    : 'Finish Quest →'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Completion Summary Card */
        <div className="rounded-2xl bg-white/75 border border-white p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7e4cf6]/15 px-3.5 py-1 text-xs font-bold text-[#6b3be0]">
            Quest Complete • {rankTitle}
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            SROCI Recruitment Run Summary
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Final Tracker Status: <strong className="text-slate-900">{trackerStatus}</strong> • Mode:{' '}
            <strong className="text-slate-900">{selectedChannel}</strong>
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-1">
            <div className="rounded-2xl bg-white p-3 border border-slate-200/70">
              <div className="text-[11px] text-slate-500">Total XP</div>
              <div className="text-lg font-bold text-[#7e4cf6]">{xp}</div>
            </div>
            <div className="rounded-2xl bg-white p-3 border border-slate-200/70">
              <div className="text-[11px] text-slate-500">Optimal Moves</div>
              <div className="text-lg font-bold text-emerald-700">
                {correctCount}/{SCENARIO_BANK.length}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3 border border-slate-200/70">
              <div className="text-[11px] text-slate-500">Best Streak</div>
              <div className="text-lg font-bold text-amber-700">{bestStreak}x</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="rounded-xl bg-[#7e4cf6] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#6b3be0] transition-all cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};