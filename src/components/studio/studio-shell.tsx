"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  MessageSquarePlus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Avatar } from "@/components/ui/avatar";
import { NewChatModal } from "./new-chat-modal";
import { cn } from "@/lib/utils";

type User = { id: string; name: string; email: string };

export function StudioShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [newChatOpen, setNewChatOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: conversations } = trpc.conversation.list.useQuery();
  const { data: me } = trpc.auth.me.useQuery();

  const del = trpc.conversation.delete.useMutation({
    onSuccess: (_, vars) => {
      utils.conversation.list.invalidate();
      if (pathname === `/studio/c/${vars.id}`) router.push("/studio");
    },
  });
  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      router.push("/login");
      router.refresh();
    },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2 px-4 py-4">
          <Link href="/studio" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="font-semibold tracking-tight">Muse</span>
          </Link>
        </div>

        <div className="space-y-1 px-3">
          <button
            onClick={() => setNewChatOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-bright"
          >
            <MessageSquarePlus className="h-4 w-4" /> New chat
          </button>
          <Link href="/studio/personas">
            <span
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname.startsWith("/studio/personas")
                  ? "bg-elevated text-text"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <Wand2 className="h-4 w-4" /> Personas
            </span>
          </Link>
        </div>

        <div className="mt-5 px-4 text-xs font-medium uppercase tracking-wider text-faint">
          Chats
        </div>
        <nav className="mt-1 flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
          {conversations?.length === 0 && (
            <p className="px-2 py-2 text-xs text-faint">No chats yet.</p>
          )}
          {conversations?.map((c) => {
            const active = pathname === `/studio/c/${c.id}`;
            return (
              <Link key={c.id} href={`/studio/c/${c.id}`}>
                <span
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-elevated text-text"
                      : "text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <span className="shrink-0 text-base">{c.persona.emoji}</span>
                  <span className="min-w-0 flex-1 truncate">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      del.mutate({ id: c.id });
                    }}
                    className="rounded p-0.5 text-faint opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            {me && <Avatar name={me.name} color={me.avatarColor} size={26} />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {user.name}
              </span>
              <span className="block truncate text-xs text-faint">
                {user.email}
              </span>
            </span>
            <button
              onClick={() => logout.mutate()}
              className="rounded-md p-1.5 text-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">{children}</main>

      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </div>
  );
}
