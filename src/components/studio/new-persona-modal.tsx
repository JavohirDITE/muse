"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { MODELS, PERSONA_EMOJIS } from "@/lib/constants";

export function NewPersonaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(PERSONA_EMOJIS[0]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].value);

  const create = trpc.persona.create.useMutation({
    onSuccess: async (p) => {
      await utils.persona.list.invalidate();
      toast.success(`Persona “${p.name}” created`);
      onClose();
      router.push(`/studio/personas/${p.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="New persona" width="max-w-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ name, emoji, systemPrompt, model });
        }}
        className="space-y-4 p-5"
      >
        <div className="flex gap-3">
          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Emoji
            </span>
            <select
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="h-[42px] rounded-lg border border-border bg-bg/60 px-2 text-lg outline-none focus:border-brand"
            >
              {PERSONA_EMOJIS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <label className="block flex-1">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Name
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marketing Copywriter"
              required
              className="w-full rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            System prompt
          </span>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a witty marketing copywriter who…"
            rows={4}
            required
            className="w-full resize-none rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Model
          </span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} — {m.hint}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create persona
          </Button>
        </div>
      </form>
    </Modal>
  );
}
