import { getSession } from "@/lib/auth";
import { db } from "@/server/db";
import {
  buildMessages,
  retrieveKnowledge,
  streamCompletion,
  type ChatMessage,
} from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { conversationId?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { conversationId, content } = body;
  if (!conversationId || !content?.trim()) {
    return new Response("Missing conversationId or content", { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      persona: { include: { knowledge: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  });
  if (!conversation || conversation.userId !== session.userId) {
    return new Response("Not found", { status: 404 });
  }

  // Persist the user's message; name the chat from its first message.
  await db.message.create({
    data: { conversationId, role: "USER", content: content.trim() },
  });
  if (conversation.title === "New chat") {
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        title:
          content.trim().slice(0, 60) +
          (content.trim().length > 60 ? "…" : ""),
      },
    });
  }

  const history: ChatMessage[] = conversation.messages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  const knowledge = retrieveKnowledge(
    conversation.persona.knowledge,
    content,
    3,
  );

  const messages = buildMessages({
    systemPrompt: conversation.persona.systemPrompt,
    knowledge,
    history,
    userContent: content.trim(),
  });

  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamCompletion({
          model: conversation.persona.model,
          temperature: conversation.persona.temperature,
          messages,
        })) {
          full += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong.";
        controller.enqueue(encoder.encode(`\n\n_Error: ${msg}_`));
        full += `\n\n_Error: ${msg}_`;
      } finally {
        // Persist the assistant's reply and bump the conversation.
        await db.message.create({
          data: { conversationId, role: "ASSISTANT", content: full },
        });
        await db.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Knowledge-Used": String(knowledge.length),
    },
  });
}
