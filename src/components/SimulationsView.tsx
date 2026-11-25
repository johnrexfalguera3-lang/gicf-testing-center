import { useEffect, useState } from 'react';
import { ChatPracticeBox } from './ChatPracticeBox';
import { CHAT_SIMULATION_PROMPTS } from '../data/chatSimulationPrompts';

type ChannelMode = 'Voice' | 'Chat' | 'Email';
type TopicFilter = 'All' | 'Order Status' | 'Billing / Refund' | 'Escalations';

interface ScenarioItem {
  id: string;
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
  {
    id: 'voice-order-status',
    channel: 'Voice',
    topic: 'Order Status',
    title: 'Order Status & Delivery Update',
    summary: 'Reassure a caller checking on a delayed order and set clear next steps.',
    estimatedMinutes: 5,
    situation:
      'A customer calls asking why their order is still showing in transit past the initial estimate and wants to know when it will arrive.',
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
    channel: 'Voice',
    topic: 'Billing / Refund',
    title: 'Billing & Refund Clarification',
    summary: 'Walk a caller through a charge or refund timeline clearly and patiently.',
    estimatedMinutes: 7,
    situation:
      'A caller asks about card payment options and how long a refund takes to post back to their account.',
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
    channel: 'Voice',
    topic: 'Escalations',
    title: 'Frustrated Caller De-Escalation',
    summary: 'Lower tension on a live call, own the moment, and guide toward resolution.',
    estimatedMinutes: 8,
    situation:
      'A caller is frustrated about repeated delays or promo/bundle confusion and wants a clear resolution.',
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
    channel: 'Chat',
    topic: 'Order Status',
    title: 'Delayed Order Check-In',
    summary: 'Practice live chat replies for an order past its initial delivery window.',
    estimatedMinutes: 6,
    situation:
      'A customer messages on chat asking why their order is still in transit past the initial estimate.',
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
    channel: 'Chat',
    topic: 'Billing / Refund',
    title: 'Card Payment & Refund Timeline',
    summary: 'Guide a chat customer through card payments and refund processing windows.',
    estimatedMinutes: 6,
    situation:
      'A customer asks on chat if credit cards are accepted and how long refunds take.',
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
    channel: 'Chat',
    topic: 'Escalations',
    title: 'Promo vs. Group Meal & BOGO Options',
    summary: 'Help a chat customer compare promos, group meals, and BOGO choices.',
    estimatedMinutes: 6,
    situation:
      'A customer skips a promo code in chat to ask about group meals and buy-one-take-one options.',
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
    channel: 'Email',
    topic: 'Order Status',
    title: 'Written Order Status Follow-Up',
    summary: 'Draft a clear, structured email update on an order delay.',
    estimatedMinutes: 7,
    situation:
      'A customer emails asking for a clear status update and next steps on a delayed order.',
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
];

const TOPICS: TopicFilter[] = ['All', 'Order Status', 'Billing / Refund', 'Escalations'];

export function SimulationsView({ accountName, lob }: SimulationsViewProps) {
  const initialMode: ChannelMode =
    lob === 'Chat' || lob === 'Email' || lob === 'Voice' ? lob : 'Voice';

  const [mode, setMode] = useState<ChannelMode>(initialMode);
  const [topic, setTopic] = useState<TopicFilter>('All');
  const [selectedId, setSelectedId] = useState<string>('voice-order-status');
  const [practicedIds, setPracticedIds] = useState<string[]>([]);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [selectedChatPromptId, setSelectedChatPromptId] = useState<string>(
    CHAT_SIMULATION_PROMPTS[0].id
  );

  const filteredScenarios = SCENARIOS.filter((item) => {
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Simulations</h1>
          <p className="text-sm text-slate-600">
            {accountName} • Choose Voice, Chat, or Email practice • Self-paced proficiency (no grading)
          </p>
        </div>

        <div className="rounded-full bg-white/75 backdrop-blur-md border border-white/80 px-4 py-1.5 text-xs font-semibold text-purple-900 shadow-sm">
          Practiced this session: {practicedIds.length} / {SCENARIOS.length}
        </div>
      </div>

      {/* Frosted Channel & Topic Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(14,10,36,0.05)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 mr-1">Mode:</span>
          {(['Voice', 'Chat', 'Email'] as ChannelMode[]).map((channel) => {
            const active = mode === channel;
            return (
              <button
                key={channel}
                type="button"
                onClick={() => setMode(channel)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#7e4cf6]/95 text-white shadow-md shadow-[#7e4cf6]/20'
                    : 'bg-white/75 text-slate-700 border border-white/80 hover:bg-white'
                }`}
              >
                {channel}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TOPICS.map((item) => {
            const active = topic === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-[#0e0a24]/90 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/75'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Glass Practice Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Glass Scenario List */}
        <div className="lg:col-span-4 space-y-3">
          {filteredScenarios.length === 0 ? (
            <div className="rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-5 text-sm text-slate-600 shadow-[0_8px_30px_rgba(14,10,36,0.05)]">
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
                  className={`w-full text-left rounded-2xl border backdrop-blur-xl p-4 transition ${
                    selected
                      ? 'border-[#7e4cf6]/70 bg-white/85 ring-2 ring-[#7e4cf6]/25 shadow-lg shadow-[#7e4cf6]/10'
                      : 'border-white/75 bg-white/65 hover:bg-white/80 shadow-[0_8px_24px_rgba(14,10,36,0.04)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span className="rounded-lg bg-purple-500/10 border border-purple-200/70 px-2 py-0.5 font-medium text-purple-800">
                      {item.channel} • {item.topic}
                    </span>
                    <span className="text-slate-500">~{item.estimatedMinutes} min</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-900">
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={done ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      {done ? 'Practiced ✓' : 'Ready to practice'}
                    </span>
                    <span className="font-medium text-[#7e4cf6]">Open →</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Glass Active Scenario & Interactive Practice Panel */}
        <div className="lg:col-span-8 rounded-2xl border border-white/75 bg-white/70 backdrop-blur-xl p-6 shadow-[0_12px_36px_rgba(14,10,36,0.06)] space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7e4cf6]">
                {activeScenario.channel} • {activeScenario.topic} • ~{activeScenario.estimatedMinutes} Min Practice
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {activeScenario.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => togglePracticed(activeScenario.id)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition shadow-sm ${
                isPracticed
                  ? 'bg-emerald-600/95 text-white hover:bg-emerald-700'
                  : 'bg-[#7e4cf6]/95 text-white hover:bg-[#6b3be0]'
              }`}
            >
              {isPracticed ? 'Marked as Practiced ✓' : 'Mark as Practiced'}
            </button>
          </div>

          <div className="rounded-xl bg-white/65 backdrop-blur-md border border-white/80 p-4">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              Scenario Situation
            </div>
            <p className="text-sm text-slate-700">{activeScenario.situation}</p>
          </div>

          {mode === 'Chat' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Chat Prompt:
                </span>
                {CHAT_SIMULATION_PROMPTS.map((item) => {
                  const isSelected = item.id === activeChatPrompt.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedChatPromptId(item.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#7e4cf6]/95 text-white shadow-sm'
                          : 'bg-white/75 text-slate-700 border border-white/80 hover:bg-white'
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>

              <ChatPracticeBox
                prompt={activeChatPrompt}
                accountName={accountName}
              />
            </div>
          )}

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
              Suggested Response Flow
            </div>
            <ol className="space-y-2">
              {activeScenario.responseFlow.map((step, idx) => (
                <li key={step} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15 border border-purple-200/80 text-[11px] font-bold text-purple-900">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
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
              className="block text-xs font-semibold text-slate-700 mb-1.5"
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
              placeholder="Draft a sample response or note phrasing you want to remember..."
              className="w-full rounded-xl border border-white/80 bg-white/70 backdrop-blur-md p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#7e4cf6] focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
