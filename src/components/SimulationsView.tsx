import { useEffect, useMemo, useState } from 'react';
import { ChatPracticeBox } from './ChatPracticeBox';
import { SrociRecruitmentSimBox } from './SrociRecruitmentSimBox';
import { CHAT_SIMULATION_PROMPTS } from '../data/chatSimulationPrompts';

type ChannelMode = 'Voice' | 'Chat' | 'Email';
type TopicFilter =
  | 'All'
  | 'Order Status'
  | 'Billing / Refund'
  | 'Escalations'
  | 'Ramp & Sourcing'
  | 'Screening & Validation'
  | 'Walk-In & Tracker';

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
}

const SCENARIOS: ScenarioItem[] = [
  // SPAVI Customer Support Scenarios
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

  // SROCI Recruitment Scenarios (Ramp -> Job Post -> Prescreen -> Validate -> Walk-In -> Tracker -> Follow-Up)
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

export function SimulationsView({ accountName, lob }: SimulationsViewProps) {
  const normalizedAccount = (accountName || 'SPAVI').trim().toUpperCase();
  const isSroci = normalizedAccount === 'SROCI';

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
  const [practicedIds, setPracticedIds] = useState<string[]>([]);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [selectedChatPromptId, setSelectedChatPromptId] = useState<string>(
    CHAT_SIMULATION_PROMPTS[0].id
  );
  const [showInteractiveSim, setShowInteractiveSim] = useState<boolean>(isSroci);

  useEffect(() => {
    setMode(initialMode);
    setTopic('All');
    setShowInteractiveSim(isSroci);
    const firstForAccount = SCENARIOS.find(
      (s) => s.accountScope === (isSroci ? 'SROCI' : 'SPAVI')
    );
    if (firstForAccount) {
      setSelectedId(firstForAccount.id);
    }
  }, [isSroci, initialMode]);

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
              className="rounded-xl bg-[#7e4cf6] px-3.5 py-1.5 text-xs font-semibold text-white border border-white/30 hover:bg-[#6b3be0] transition cursor-pointer"
            >
              {showInteractiveSim ? 'Hide Pipeline Quest' : 'Launch Pipeline Quest'}
            </button>
          )}
          <div className="glass-card px-4 py-1.5 text-xs font-semibold text-purple-950">
            Practiced this session: {practicedIds.length} / {accountScenarios.length}
          </div>
        </div>
      </div>

      {/* Gamified End-to-End SROCI Pipeline Quest */}
      {isSroci && showInteractiveSim && (
        <SrociRecruitmentSimBox
          lob={mode}
          onCompleteSession={() => {
            if (!practicedIds.includes(activeScenario.id)) {
              setPracticedIds((prev) => [...prev, activeScenario.id]);
            }
          }}
        />
      )}

      {/* Frosted Channel & Topic Filter Bar */}
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] cursor-pointer ${
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
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer ${
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

      {/* Two-Column Glass Practice Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Scenario List */}
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
                  className={`w-full text-left rounded-[18px] border p-4 backdrop-blur-[26px] transition-all duration-150 active:scale-[0.98] cursor-pointer ${
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

        {/* Active Scenario & Interactive Practice Panel */}
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
              className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97] active:ring-2 cursor-pointer ${
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