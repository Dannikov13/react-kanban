import { useState } from 'react';
import { type ChatMessage, sendAiMessage } from '@/shared/api/ai.ts';

export function AiChat() {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleSend() {
    if (isLoading || message.trim() === '') return;

    setError('');
    setIsLoading(true);
    const question = message;

    try {
      const reply = await sendAiMessage(question, messages);

      setMessages((previous) => [
        ...previous,
        { role: 'user', content: question },
        { role: 'assistant', content: reply },
      ]);
      setMessage((current) => (current === question ? '' : current));
    } catch {
      setError('Could not get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {isOpen && (
        <div
          id="ai-chat-panel"
          className="mb-4 flex max-h-[calc(100dvh-8rem)] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-teal-200 bg-white text-slate-800 shadow-xl shadow-teal-950/15 dark:border-teal-800 dark:bg-slate-900 dark:text-slate-100"
        >
          <div className="flex shrink-0 items-center gap-3 bg-teal-700 p-4 text-white">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl"
            >
              🐰
            </span>
            <div>
              <h2 className="font-semibold">Bunny — your AI assistant</h2>
              <p className="mt-1 text-xs text-teal-100">
                Let's tackle tasks one step at a time
              </p>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-4">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.repeat &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Where shall we start?"
              aria-label="Message Bunny"
              rows={3}
              className="block w-full resize-none rounded-2xl border border-teal-200 bg-teal-50/60 p-3 text-sm placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:border-teal-800 dark:bg-slate-800 dark:placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || message.trim() === ''}
              className="mt-3 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Thinking…' : 'Send'}
            </button>

            {error && (
              <p
                role="alert"
                className="mt-3 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}

            <div className="mt-3 space-y-3" aria-live="polite">
              {messages.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-teal-50 p-3 dark:bg-slate-800"
                >
                  <p className="mb-1 text-xs font-semibold">
                    {item.role === 'user' ? 'You' : 'Bunny'}
                  </p>
                  <p className="whitespace-pre-wrap wrap-anywhere text-sm">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? 'Close chat with Bunny' : 'Open chat with Bunny'}
        aria-expanded={isOpen}
        aria-controls="ai-chat-panel"
        title={isOpen ? 'Close chat' : 'Bunny — your AI assistant'}
        className="ml-auto flex h-16 w-16 items-center justify-center rounded-full border border-teal-400 bg-linear-to-br from-teal-500 to-teal-700 text-3xl text-white shadow-lg shadow-teal-700/30 transition duration-200 hover:from-teal-400 hover:to-teal-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 motion-safe:hover:-translate-y-1"
      >
        <span aria-hidden="true">{isOpen ? '✕' : '🐰'}</span>
      </button>
    </div>
  );
}
