import { FormEvent, useEffect, useState } from 'react';
import { ChatSimulationPrompt } from '../data/chatSimulationPrompts';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
}

interface ChatPracticeBoxProps {
  prompt: ChatSimulationPrompt;
  accountName: string;
}

function getNextCustomerReply(
  prompt: ChatSimulationPrompt,
  agentTurnCount: number
): string {
  const index = agentTurnCount - 1;
  if (index >= 0 && index < prompt.scriptedReplies.length) {
    return prompt.scriptedReplies[index];
  }
  return prompt.wrapUpMessage;
}

export function ChatPracticeBox({ prompt, accountName }: ChatPracticeBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: `${prompt.id}-init`,
      sender: 'customer',
      text: prompt.openingMessage,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [agentTurns, setAgentTurns] = useState(0);

  useEffect(() => {
    setMessages([
      {
        id: `${prompt.id}-init`,
        sender: 'customer',
        text: prompt.openingMessage,
      },
    ]);
    setDraft('');
    setAgentTurns(0);
  }, [prompt]);

  const handleReset = () => {
    setMessages([
      {
        id: `${prompt.id}-init-${Date.now()}`,
        sender: 'customer',
        text: prompt.openingMessage,
      },
    ]);
    setDraft('');
    setAgentTurns(0);
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    const nextTurn = agentTurns + 1;
    const customerReplyText = getNextCustomerReply(prompt, nextTurn);

    setMessages((prev) => [
      ...prev,
      { id: `agent-${nextTurn}-${Date.now()}`, sender: 'agent', text: trimmed },
      {
        id: `customer-${nextTurn}-${Date.now() + 1}`,
        sender: 'customer',
        text: customerReplyText,
      },
    ]);
    setAgentTurns(nextTurn);
    setDraft('');
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-purple-900">
            {accountName || 'SPAVI'} • Interactive Chat Practice (Ungraded)
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {prompt.title}
          </div>
          <div className="text-xs text-slate-700">{prompt.customerPersona}</div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="glass-btn rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer"
        >
          Reset Chat
        </button>
      </div>

      <div className="glass-card max-h-72 overflow-y-auto space-y-2.5 p-3">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  isAgent
                    ? 'bg-[#7e4cf6] text-white border border-white/30 shadow-sm'
                    : 'bg-white/75 text-slate-900 border border-white/85'
                }`}
              >
                <div
                  className={`text-[10px] font-semibold uppercase mb-0.5 ${
                    isAgent ? 'text-purple-100' : 'text-slate-600'
                  }`}
                >
                  {isAgent ? 'Agent (You)' : 'Customer'}
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your chat reply as the agent..."
          className="glass-card flex-1 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#7e4cf6] focus:bg-white/70 focus:outline-none transition"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#7e4cf6] px-4 py-2 text-xs font-semibold text-white border border-white/35 transition-all duration-150 hover:bg-[#6b3be0] hover:border-white/75 hover:-translate-y-0.5 active:scale-[0.97] active:ring-2 active:ring-[#7e4cf6]/40 cursor-pointer"
        >
          Send
        </button>
      </form>

      <div className="glass-card p-3">
        <div className="text-xs font-semibold text-purple-950 mb-1">
          Self-Practice Reminders
        </div>
        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-800">
          {prompt.coachingTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
