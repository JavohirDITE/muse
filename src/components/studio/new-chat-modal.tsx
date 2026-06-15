"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Modal } from "@/components/ui/modal";

export function NewChatModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: personas } = trpc.persona.list.useQuery(undefined, {
    enabled: open,
  });

  const create = trpc.conversation.create.useMutation({
    onSuccess: async (convo) => {
      await utils.conversation.list.invalidate();
      onClose();
      router.push(`/studio/c/${convo.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="Start a chat">
      <div className="p-4">
        <p className="mb-3 px-1 text-sm text-muted">
          Pick an assistant to chat with.
        </p>
        <div className="space-y-1.5">
          {personas?.map((p) => (
            <button
              key={p.id}
              onClick={() => create.mutate({ personaId: p.id })}
              disabled={create.isPending}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-left transition-colors hover:border-faint disabled:opacity-60"
            >
              <span className="text-xl">{p.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {p.name}
                </span>
                {p.description && (
                  <span className="block truncate text-xs text-faint">
                    {p.description}
                  </span>
                )}
              </span>
              {p._count.knowledge > 0 && (
                <span className="rounded bg-brand-soft/30 px-1.5 py-0.5 text-[10px] text-brand-bright">
                  {p._count.knowledge} docs
                </span>
              )}
            </button>
          ))}
          {personas?.length === 0 && (
            <p className="py-6 text-center text-sm text-faint">
              No personas yet. Create one first.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
