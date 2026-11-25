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
  // Zero-API helper: swap this function later to call your AI Edge Function
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
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-purple-700">
            {accountName} • Interactive Chat Practice (Ungraded)
          </div>
          <div className="text-sm font-semibold text-slate-900">{prompt.title}</div>
          <div className="text-xs text-slate-500">{prompt.customerPersona}</div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
        >
          Reset Chat
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-2.5 rounded-lg border border-slate-200 bg-white p-3">
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
                    ? 'bg-[#7e4cf6] text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <div
                  className={`text-[10px] font-semibold uppercase mb-0.5 ${
                    isAgent ? 'text-purple-100' : 'text-slate-500'
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
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#7e4cf6] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#7e4cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b3be0] transition"
        >
          Send
        </button>
      </form>

      <div className="rounded-lg bg-purple-50/70 border border-purple-100 p-3">
        <div className="text-xs font-semibold text-purple-900 mb-1">
          Self-Practice Reminders
        </div>
        <ul className="list-disc pl-4 space-y-1 text-xs text-purple-950/80">
          {prompt.coachingTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
