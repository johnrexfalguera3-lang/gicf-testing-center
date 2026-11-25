import React, { useMemo, useState } from 'react';

type ChannelLob = 'Voice' | 'Chat' | 'Email';

interface PracticeScenario {
  id: string;
  channel: ChannelLob;
  title: string;
  category: string;
  estimatedMinutes: number;
  summary: string;
  customerSituation: string;
  suggestedFlow: string[];
  keyReminders: string[];
}

interface SimulationsViewProps {
  accountName: string;
  lob?: string;
}

const PRACTICE_SCENARIOS: PracticeScenario[] = [
  // Voice scenarios
  {
    id: 'voice-order-status',
    channel: 'Voice',
    title: 'Order Status & Delivery Update',
    category: 'Order Status',
    estimatedMinutes: 5,
    summary: 'Reassure a caller checking on a delayed order and set clear next steps.',
    customerSituation:
      'A customer calls asking why their order is still showing in transit past the initial estimate and wants to know when it will arrive.',
    suggestedFlow: [
      'Warm voice greeting + confirm caller name and order details.',
      'Acknowledge the delay calmly without sounding defensive.',
      'Check latest tracking status, explain what it means in plain language, and share clear next steps.',
      'Confirm if there is anything else you can help with before closing.',
    ],
    keyReminders: [
      'Keep tone steady, empathetic, and clear.',
      'Avoid promising exact arrival times if carrier status only shows a window.',
    ],
  },
  {
    id: 'voice-billing-refund',
    channel: 'Voice',
    title: 'Billing & Refund Clarification',
    category: 'Billing / Refund',
    estimatedMinutes: 7,
    summary: 'Walk a caller through a charge or refund timeline clearly and patiently.',
    customerSituation:
      'A caller is confused about an amount on their statement or refund processing window and wants a straightforward breakdown.',
    suggestedFlow: [
      'Verify account details politely and listen through their question without interrupting.',
      'Break down the charge or refund timeline step by step.',
      'Summarize what happens next and offer a clear reference point if applicable.',
    ],
    keyReminders: [
      'Slow down when reading numbers, dates, or policy windows.',
      'Check that the caller feels heard before moving to next steps.',
    ],
  },
  {
    id: 'voice-escalation',
    channel: 'Voice',
    title: 'Frustrated Caller De-Escalation',
    category: 'Escalations',
    estimatedMinutes: 8,
    summary: 'Lower tension on a live call, own the moment, and guide toward resolution.',
    customerSituation:
      'A frustrated customer calls after a repeat issue and starts raising their voice about past hassle.',
    suggestedFlow: [
      'Let the caller vent briefly while staying calm and composed.',
      'Validate their frustration and take ownership of helping from here.',
      'Ask focused clarifying questions and outline a clear action plan.',
    ],
    keyReminders: [
      'Never match frustration or rush the caller.',
      'Follow account escalation/transfer steps accurately if needed.',
    ],
  },

  // Chat scenarios
  {
    id: 'chat-order-check',
    channel: 'Chat',
    title: 'Live Chat Order & Tracking Check',
    category: 'Order Status',
    estimatedMinutes: 5,
    summary: 'Give concise, scannable chat updates without leaving the customer waiting.',
    customerSituation:
      'A customer starts a live chat asking for an update on a recent order and whether they need to be home for delivery.',
    suggestedFlow: [
      'Greet the customer warmly and ask for their order/reference details.',
      'Send short, clear updates while checking status so they know you are active.',
      'Share delivery expectations cleanly and ask if they need anything else.',
    ],
    keyReminders: [
      'Break long explanations into short, easy-to-read chat messages.',
      'Double-check spelling and order numbers before hitting send.',
    ],
  },
  {
    id: 'chat-billing-adjustment',
    channel: 'Chat',
    title: 'Chat Billing & Voucher Question',
    category: 'Billing / Refund',
    estimatedMinutes: 6,
    summary: 'Clarify discount/billing details clearly in a fast-paced chat thread.',
    customerSituation:
      'A customer on chat asks why a promo or adjustment did not apply as expected to their order total.',
    suggestedFlow: [
      'Acknowledge the question and confirm order details.',
      'Explain how the total or adjustment was calculated in plain, friendly language.',
      'Confirm next steps and check for follow-up questions.',
    ],
    keyReminders: [
      'Keep tone friendly and matter-of-fact—avoid defensive wording.',
      'Confirm details clearly before closing the chat.',
    ],
  },

  // Email scenarios
  {
    id: 'email-refund-follow-up',
    channel: 'Email',
    title: 'Email Refund Status & Next Steps',
    category: 'Billing / Refund',
    estimatedMinutes: 7,
    summary: 'Write a structured, reassuring email response with clear timelines.',
    customerSituation:
      'A customer sends an email asking about a refund/return status and wants written confirmation of what happens next.',
    suggestedFlow: [
      'Open with a clear subject-aligned greeting and acknowledge their message.',
      'State the current status, relevant dates/windows, and any action needed from them.',
      'Close politely with clear contact/reply instructions if they have questions.',
    ],
    keyReminders: [
      'Use clear spacing or short bullet points for timelines and next steps.',
      'Review tone, dates, and reference details before sending.',
    ],
  },
  {
    id: 'email-repeat-issue',
    channel: 'Email',
    title: 'Email Follow-Up on Repeat Concern',
    category: 'Escalations',
    estimatedMinutes: 8,
    summary: 'Respond empathetically to a written follow-up with a clear resolution plan.',
    customerSituation:
      'A customer emails following up on an earlier issue that still feels unresolved and asks for a clear update.',
    suggestedFlow: [
      'Acknowledge the follow-up and validate their patience.',
      'Summarize what was reviewed and outline exact next steps or resolution.',
      'Set clear expectations on timing and invite them to reply if more help is needed.',
    ],
    keyReminders: [
      'Address every question asked in the customer’s email.',
      'Keep commitments realistic and easy to follow.',
    ],
  },
];

const CHANNELS: ChannelLob[] = ['Voice', 'Chat', 'Email'];

export const SimulationsView: React.FC<SimulationsViewProps> = ({
  accountName,
  lob,
}) => {
  const initialChannel: ChannelLob = useMemo(() => {
    const normalized = lob?.trim().toLowerCase();
    if (normalized === 'chat') return 'Chat';
    if (normalized === 'email') return 'Email';
    return 'Voice';
  }, [lob]);

  const [selectedChannel, setSelectedChannel] =
    useState<ChannelLob>(initialChannel);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string>(() => {
    const first = PRACTICE_SCENARIOS.find((s) => s.channel === initialChannel);
    return first ? first.id : PRACTICE_SCENARIOS[0].id;
  });
  const [practicedIds, setPracticedIds] = useState<Record<string, boolean>>({});
  const [notesByScenario, setNotesByScenario] = useState<Record<string, string>>(
    {}
  );

  const channelScenarios = useMemo(
    () => PRACTICE_SCENARIOS.filter((s) => s.channel === selectedChannel),
    [selectedChannel]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(channelScenarios.map((s) => s.category)));
    return ['All', ...unique];
  }, [channelScenarios]);

  const visibleScenarios = useMemo(() => {
    if (selectedCategory === 'All') return channelScenarios;
    return channelScenarios.filter((s) => s.category === selectedCategory);
  }, [channelScenarios, selectedCategory]);

  const activeScenario =
    visibleScenarios.find((s) => s.id === selectedId) ??
    visibleScenarios[0] ??
    channelScenarios[0] ??
    PRACTICE_SCENARIOS[0];

  const practicedCount = Object.values(practicedIds).filter(Boolean).length;

  const handleSelectChannel = (channel: ChannelLob) => {
    setSelectedChannel(channel);
    setSelectedCategory('All');
    const firstInChannel = PRACTICE_SCENARIOS.find((s) => s.channel === channel);
    if (firstInChannel) {
      setSelectedId(firstInChannel.id);
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    const matching =
      category === 'All'
        ? channelScenarios
        : channelScenarios.filter((s) => s.category === category);
    if (matching[0]) {
      setSelectedId(matching[0].id);
    }
  };

  const togglePracticed = (id: string) => {
    setPracticedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Simulations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {accountName} • Choose Voice, Chat, or Email practice • Self-paced proficiency (no grading)
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white border border-purple-100 rounded-xl px-4 py-2 text-xs font-medium text-slate-700 self-start">
          <span className="w-2 h-2 rounded-full bg-[#7e4cf6]" />
          <span>
            Practiced this session: <strong>{practicedCount}</strong> /{' '}
            {PRACTICE_SCENARIOS.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">
            Mode:
          </span>
          {CHANNELS.map((channel) => {
            const isSelected = selectedChannel === channel;
            return (
              <button
                key={channel}
                type="button"
                onClick={() => handleSelectChannel(channel)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-[#7e4cf6] text-white'
                    : 'bg-[#f5f4fb] text-slate-700 hover:bg-purple-100/70'
                }`}
              >
                {channel}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          {visibleScenarios.map((scenario) => {
            const isSelected = scenario.id === activeScenario.id;
            const isPracticed = Boolean(practicedIds[scenario.id]);

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedId(scenario.id)}
                className={`w-full text-left rounded-2xl p-4 border transition ${
                  isSelected
                    ? 'bg-white border-[#7e4cf6] ring-2 ring-[#7e4cf6]/15'
                    : 'bg-white border-slate-100 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7e4cf6]">
                    {scenario.channel} • {scenario.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ~{scenario.estimatedMinutes} min
                  </span>
                </div>

                <div className="font-semibold text-sm text-slate-900">
                  {scenario.title}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {scenario.summary}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span
                    className={
                      isPracticed
                        ? 'text-emerald-600 font-semibold'
                        : 'text-slate-400'
                    }
                  >
                    {isPracticed ? 'Practiced' : 'Ready to practice'}
                  </span>
                  <span className="text-[#7e4cf6] font-medium">Open →</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7e4cf6]">
                {activeScenario.channel} • {activeScenario.category} • ~
                {activeScenario.estimatedMinutes} min practice
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeScenario.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => togglePracticed(activeScenario.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition self-start ${
                practicedIds[activeScenario.id]
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#7e4cf6] hover:bg-[#6c3ae5] text-white'
              }`}
            >
              {practicedIds[activeScenario.id]
                ? 'Marked as Practiced ✓'
                : 'Mark as Practiced'}
            </button>
          </div>

          <div className="rounded-xl bg-[#f5f4fb] p-4">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              {activeScenario.channel === 'Voice'
                ? 'Caller Situation'
                : activeScenario.channel === 'Chat'
                ? 'Chat Thread Context'
                : 'Incoming Email Context'}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {activeScenario.customerSituation}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Suggested Response Flow
            </h3>
            <ol className="space-y-2">
              {activeScenario.suggestedFlow.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-[#7e4cf6] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Helpful {activeScenario.channel} Reminders
            </h3>
            <ul className="space-y-1.5">
              {activeScenario.keyReminders.map((tip) => (
                <li
                  key={tip}
                  className="text-xs text-slate-600 flex items-start gap-2"
                >
                  <span className="text-[#7e4cf6] font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Personal Practice Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notesByScenario[activeScenario.id] ?? ''}
              onChange={(e) =>
                setNotesByScenario((prev) => ({
                  ...prev,
                  [activeScenario.id]: e.target.value,
                }))
              }
              placeholder={`Draft a sample ${activeScenario.channel.toLowerCase()} response or note phrasing you want to remember...`}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7e4cf6]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
