"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Markdown } from "./markdown";

type Msg = { id: string; role: "USER" | "ASSISTANT"; content: string };

export function ChatView({ conversationId }: { conversationId: string }) {
  const utils = trpc.useUtils();
  const { data: convo, isLoading } = trpc.conversation.byId.useQuery({
    id: conversationId,
  });

  const [messages, setMessages] = useState<Msg[]>([]);
  const [initId, setInitId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Seed local messages from the loaded conversation (once per conversation).
  if (convo && initId !== convo.id) {
    setInitId(convo.id);
    setMessages(
      convo.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })),
    );
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, draft]);

  async function send() {
    const content = input.trim();
    if (!content || streaming) return;

    setInput("");
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "USER", content },
    ]);
    setStreaming(true);
    setDraft("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });
      if (!res.ok || !res.body) {
        throw new Error(await res.text().catch(() => "Request failed"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setDraft(acc);
      }

      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "ASSISTANT", content: acc },
      ]);
      setDraft("");
      utils.conversation.list.invalidate();
      utils.conversation.byId.invalidate({ id: conversationId });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to stream response");
    } finally {
      setStreaming(false);
    }
  }

  if (isLoading || !convo) {
    return (
      <div className="flex h-full flex-col">
        <div className="h-[57px] border-b border-border" />
        <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-6">
          <div className="h-16 rounded-xl skeleton" />
          <div className="h-24 rounded-xl skeleton" />
        </div>
      </div>
    );
  }

  const empty = messages.length === 0 && !streaming;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span className="text-xl">{convo.persona.emoji}</span>
        <div>
          <h1 className="text-sm font-semibold leading-tight">
            {convo.persona.name}
          </h1>
          <span className="text-xs text-faint">{convo.persona.model}</span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-6 py-6">
          {empty && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="mb-3 text-4xl">{convo.persona.emoji}</span>
              <p className="text-muted">
                {convo.persona.description ??
                  "Send a message to start the conversation."}
              </p>
            </div>
          )}

          <div className="space-y-5">
            {messages.map((m) => (
              <Bubble
                key={m.id}
                role={m.role}
                content={m.content}
                emoji={convo.persona.emoji}
              />
            ))}
            {streaming && (
              <Bubble
                role="ASSISTANT"
                content={draft}
                emoji={convo.persona.emoji}
                streaming
              />
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 py-4">
        <div className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-2xl border border-border bg-surface-2 px-3 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={`Message ${convo.persona.name}…`}
            className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-faint"
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-bright disabled:opacity-40"
            aria-label="Send"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-faint">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  emoji,
  streaming,
}: {
  role: "USER" | "ASSISTANT";
  content: string;
  emoji: string;
  streaming?: boolean;
}) {
  const isUser = role === "USER";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated text-sm">
        {isUser ? <Sparkles className="hidden" /> : emoji}
        {isUser && <span className="text-xs font-semibold text-muted">You</span>}
      </span>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-brand text-white"
            : "border border-border bg-surface"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        ) : (
          <div className={streaming ? "cursor-caret" : ""}>
            <Markdown content={content} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
