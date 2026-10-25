"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

const suggestions = [
  "How do I file a complaint?",
  "What categories are available?",
  "How do I track my complaint?",
  "How does AI photo analysis work?",
];

type Message = {
  id: number;
  text: string;
  sender: "assistant" | "user";
};

function getAnswer(question: string): string {
  const text = question.toLowerCase();

  if (text.includes("categor") || text.includes("type of issue")) {
    return "You can report issues in Classroom, Bathroom, Lab, Library, Playground, and Canteen / Other. Choose the category that best matches the issue when filing.";
  }

  if (
    text.includes("file") ||
    text.includes("submit") ||
    text.includes("report") ||
    text.includes("new complaint")
  ) {
    return 'To file a complaint, choose "New Complaint" or "File a Complaint", select a category, then choose the location and problem type. Add a room or area, describe the issue, attach up to 3 photos if useful, and submit.';
  }

  if (
    text.includes("track") ||
    text.includes("status") ||
    text.includes("my complaint") ||
    text.includes("my report")
  ) {
    return 'Open "My Complaints" in the navigation to see your submitted complaints and their current status: Pending, In Progress, or Resolved.';
  }

  if (
    text.includes("photo") ||
    text.includes("image") ||
    text.includes("picture") ||
    text.includes("ai")
  ) {
    return "You can attach up to 3 photos (up to 8 MB each) when filing a complaint. The photos are included with your report for the campus team to review. Automated AI photo analysis is not currently configured.";
  }

  if (
    text.includes("admin") ||
    text.includes("assign") ||
    text.includes("worker") ||
    text.includes("department")
  ) {
    return "Admins can review complaints, update their status and priority, assign them to a department or worker, and add an admin remark from the complaint details page.";
  }

  if (text.includes("location") || text.includes("room") || text.includes("block")) {
    return "Select the location or block from the list for your chosen category. You can also add a room number or specific area in the next field.";
  }

  if (text.includes("hello") || text.includes("hi ") || text === "hi" || text === "hey") {
    return "Hi! I can help with filing complaints, available categories, tracking reports, photos, and admin features. What would you like to know?";
  }

  return 'I can help with filing a complaint, available categories, tracking a complaint, photo uploads, and admin features. Try one of the suggested questions, or ask me about one of those topics.';
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(1);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function sendQuestion(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: nextMessageId.current++,
      text: trimmed,
      sender: "user",
    };
    const assistantMessage: Message = {
      id: nextMessageId.current++,
      text: getAnswer(trimmed),
      sender: "assistant",
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setQuestion("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(question);
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      {isOpen && (
        <section
          aria-label="CollegeFix Assistant"
          className="mb-3 flex h-[min(34rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">CollegeFix Assistant</p>
                <p className="text-xs text-blue-100">Online - here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat assistant"
              className="rounded-md p-2 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div
            ref={threadRef}
            aria-live="polite"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
          >
            <div className="flex items-start gap-2">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Bot className="h-4 w-4" />
              </span>
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm">
                Hi! I&apos;m the CollegeFix Assistant. I can help you file
                complaints, track status, and answer questions about the system.
                What can I help you with?
              </p>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "items-start gap-2"}`}
              >
                {message.sender === "assistant" && (
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                    message.sender === "user"
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendQuestion(item)}
                  className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {item}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label className="sr-only" htmlFor="collegefix-chat-question">
                Ask a question
              </label>
              <input
                id="collegefix-chat-question"
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question..."
                className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!question.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
