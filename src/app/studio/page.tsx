"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewChatModal } from "@/components/studio/new-chat-modal";

export default function StudioHome() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md px-6 text-center"
      >
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-fuchsia-500">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold">Welcome to your studio</h1>
        <p className="mt-2 text-muted">
          Start a conversation with one of your assistants, or craft a new
          persona with its own prompt and knowledge base.
        </p>
        <Button className="mt-6" size="lg" onClick={() => setOpen(true)}>
          <MessageSquarePlus className="h-4 w-4" /> New chat
        </Button>
      </motion.div>
      <NewChatModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
