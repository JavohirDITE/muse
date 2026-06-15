"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Code2,
  MessagesSquare,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const fade: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE },
  }),
};

const features = [
  {
    icon: Wand2,
    title: "Custom personas",
    body: "Give each assistant its own system prompt, model and temperature. Switch instantly between a code reviewer, a strategist, a tutor.",
  },
  {
    icon: BookOpen,
    title: "Grounded answers (RAG)",
    body: "Attach a knowledge base to a persona. The most relevant snippets are retrieved and injected into the prompt at chat time.",
  },
  {
    icon: Zap,
    title: "Real streaming",
    body: "Responses stream token-by-token over a ReadableStream, persisted as they complete. Works with OpenAI or a built-in mock model.",
  },
  {
    icon: MessagesSquare,
    title: "Saved conversations",
    body: "Every thread is stored and titled automatically, with full history fed back as context.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden aurora">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Mark />
          <span className="text-lg font-semibold tracking-tight">Muse</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-10 text-center sm:pt-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fade}
          custom={0}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-bright" />
          Streaming AI · RAG · OpenAI · Next.js
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fade}
          custom={1}
          className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
        >
          Your own{" "}
          <span className="bg-gradient-to-r from-brand-bright via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            AI assistant studio
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fade}
          custom={2}
          className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted"
        >
          Design assistants with their own prompts and knowledge, then chat with
          fast, streaming responses. Bring an OpenAI key — or try the built-in
          mock model.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fade}
          custom={3}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link href="/register">
            <Button size="lg">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/JavohirDITE"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="secondary">
              <Code2 className="h-4 w-4" /> Source
            </Button>
          </a>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={fade}
              custom={i}
              className="group rounded-xl border border-border bg-surface/60 p-6 transition-colors hover:border-faint"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft/30 text-brand-bright transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-faint sm:flex-row">
          <span>Muse — a portfolio project</span>
          <span>Next.js · tRPC · Prisma · OpenAI · Tailwind</span>
        </div>
      </footer>
    </div>
  );
}

function Mark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500">
      <Sparkles className="h-4 w-4 text-white" />
    </span>
  );
}
