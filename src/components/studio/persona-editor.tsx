"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { MODELS } from "@/lib/constants";
import { formatRelative } from "@/lib/utils";

export function PersonaEditor({ personaId }: { personaId: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: persona, isLoading } = trpc.persona.byId.useQuery({
    id: personaId,
  });

  const [form, setForm] = useState<{
    name: string;
    emoji: string;
    description: string;
    systemPrompt: string;
    model: string;
    temperature: number;
  } | null>(null);
  const [initId, setInitId] = useState<string | null>(null);
  const [knowledge, setKnowledge] = useState("");

  if (persona && initId !== persona.id) {
    setInitId(persona.id);
    setForm({
      name: persona.name,
      emoji: persona.emoji,
      description: persona.description ?? "",
      systemPrompt: persona.systemPrompt,
      model: persona.model,
      temperature: persona.temperature,
    });
  }

  const save = trpc.persona.update.useMutation({
    onSuccess: () => {
      utils.persona.list.invalidate();
      utils.persona.byId.invalidate({ id: personaId });
      toast.success("Saved");
    },
    onError: (e) => toast.error(e.message),
  });
  const addKnowledge = trpc.persona.addKnowledge.useMutation({
    onSuccess: () => {
      setKnowledge("");
      utils.persona.byId.invalidate({ id: personaId });
      utils.persona.list.invalidate();
      toast.success("Knowledge added");
    },
    onError: (e) => toast.error(e.message),
  });
  const removeKnowledge = trpc.persona.removeKnowledge.useMutation({
    onSuccess: () => utils.persona.byId.invalidate({ id: personaId }),
  });
  const del = trpc.persona.delete.useMutation({
    onSuccess: () => {
      utils.persona.list.invalidate();
      toast.success("Persona deleted");
      router.push("/studio/personas");
    },
  });

  if (isLoading || !persona || !form) {
    return (
      <div className="p-8">
        <div className="h-7 w-48 rounded skeleton" />
      </div>
    );
  }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const inputClass =
    "w-full rounded-lg border border-border bg-bg/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

  return (
    <div className="h-full overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg/80 px-8 py-3.5 backdrop-blur">
        <button
          onClick={() => router.push("/studio/personas")}
          className="rounded-md p-1.5 text-faint transition-colors hover:bg-elevated hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xl">{form.emoji}</span>
        <h1 className="flex-1 text-sm font-semibold">{form.name}</h1>
        <button
          onClick={() => del.mutate({ id: personaId })}
          className="rounded-md p-1.5 text-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete persona"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <Button
          size="sm"
          onClick={() => save.mutate({ id: personaId, ...form })}
          disabled={save.isPending}
        >
          {save.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </Button>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 p-8">
        <div className="flex gap-3">
          <input
            value={form.emoji}
            onChange={(e) => set("emoji", e.target.value)}
            className="w-16 rounded-lg border border-border bg-bg/40 px-3 py-2.5 text-center text-xl outline-none focus:border-brand"
          />
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Name"
            className={inputClass}
          />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Description
          </span>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short tagline"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            System prompt
          </span>
          <textarea
            value={form.systemPrompt}
            onChange={(e) => set("systemPrompt", e.target.value)}
            rows={6}
            className={`${inputClass} resize-y font-mono text-[13px]`}
          />
        </label>

        <div className="flex gap-4">
          <label className="block flex-1">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Model
            </span>
            <select
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              className={inputClass}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block w-48">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Temperature · {form.temperature.toFixed(1)}
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={form.temperature}
              onChange={(e) => set("temperature", Number(e.target.value))}
              className="mt-3 w-full accent-brand"
            />
          </label>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-brand-bright" /> Knowledge base
          </h2>
          <p className="mb-4 text-xs text-muted">
            Snippets here are retrieved by relevance and injected into the prompt
            at chat time (lightweight RAG).
          </p>

          <div className="mb-4 flex items-end gap-2">
            <textarea
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
              placeholder="Paste a fact, policy, or doc snippet…"
              rows={2}
              className={`${inputClass} resize-none`}
            />
            <Button
              onClick={() =>
                knowledge.trim() &&
                addKnowledge.mutate({ personaId, content: knowledge.trim() })
              }
              disabled={addKnowledge.isPending || !knowledge.trim()}
            >
              {addKnowledge.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {persona.knowledge.map((k) => (
              <div
                key={k.id}
                className="group flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <p className="min-w-0 flex-1 text-sm text-muted">{k.content}</p>
                <span className="shrink-0 text-[11px] text-faint">
                  {formatRelative(k.createdAt)}
                </span>
                <button
                  onClick={() => removeKnowledge.mutate({ id: k.id })}
                  className="shrink-0 rounded p-1 text-faint opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {persona.knowledge.length === 0 && (
              <p className="text-sm text-faint">No knowledge yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
