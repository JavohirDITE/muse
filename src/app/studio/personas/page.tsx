"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, MessageSquare, Plus, Wand2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { NewPersonaModal } from "@/components/studio/new-persona-modal";

export default function PersonasPage() {
  const [open, setOpen] = useState(false);
  const { data: personas, isLoading } = trpc.persona.list.useQuery();

  return (
    <div className="h-full overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-8 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold">Personas</h1>
          <p className="text-sm text-muted">
            Reusable assistants with their own prompt and knowledge.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New persona
        </Button>
      </header>

      <div className="mx-auto max-w-4xl p-8">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-32 rounded-xl skeleton" />
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {personas?.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/studio/personas/${p.id}`}>
                <div className="group h-full rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-faint">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-xl">
                      {p.emoji}
                    </span>
                    <h3 className="font-semibold">{p.name}</h3>
                  </div>
                  {p.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-muted">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-faint">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {p._count.knowledge} docs
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {p._count.conversations} chats
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {personas?.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Wand2 className="mb-3 h-8 w-8 text-faint" />
            <p className="text-sm text-muted">No personas yet.</p>
          </div>
        )}
      </div>

      <NewPersonaModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
