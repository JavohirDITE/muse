"use client";

import { use } from "react";
import { ChatView } from "@/components/studio/chat-view";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  return <ChatView conversationId={conversationId} />;
}
