import "server-only";
import OpenAI from "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "is", "it", "for", "on",
  "with", "how", "what", "why", "do", "i", "you", "my", "me", "can", "this",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Naive keyword retrieval: scores each chunk by query-term overlap and returns
 * the top matches. A lightweight stand-in for vector search that keeps the
 * project dependency-free while demonstrating the RAG pattern.
 */
export function retrieveKnowledge(
  chunks: { id: string; content: string }[],
  query: string,
  topK = 3,
): string[] {
  const terms = new Set(tokenize(query));
  if (terms.size === 0) return [];
  return chunks
    .map((c) => {
      const words = tokenize(c.content);
      const score = words.reduce((acc, w) => acc + (terms.has(w) ? 1 : 0), 0);
      return { content: c.content, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((c) => c.content);
}

export function buildMessages(params: {
  systemPrompt: string;
  knowledge: string[];
  history: ChatMessage[];
  userContent: string;
}): ChatMessage[] {
  const { systemPrompt, knowledge, history, userContent } = params;
  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

  if (knowledge.length > 0) {
    messages.push({
      role: "system",
      content:
        "Use the following knowledge base context when relevant. If the answer isn't here, rely on your own knowledge.\n\n" +
        knowledge.map((k, i) => `[${i + 1}] ${k}`).join("\n\n"),
    });
  }

  messages.push(...history.slice(-10));
  messages.push({ role: "user", content: userContent });
  return messages;
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Streams text deltas from OpenAI, or from a mock model when no key is set. */
export async function* streamCompletion(params: {
  model: string;
  temperature: number;
  messages: ChatMessage[];
}): AsyncGenerator<string> {
  if (!hasOpenAIKey()) {
    yield* mockStream(params.messages);
    return;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await client.chat.completions.create({
    model: params.model,
    temperature: params.temperature,
    stream: true,
    messages: params.messages,
  });
  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

async function* mockStream(messages: ChatMessage[]): AsyncGenerator<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const grounded = messages.some(
    (m) => m.role === "system" && m.content.startsWith("Use the following"),
  );
  const q = lastUser?.content.trim() ?? "";

  const reply =
    `Here's a thought on **"${q.slice(0, 80)}"**.\n\n` +
    (grounded
      ? "Drawing on the persona's knowledge base, "
      : "") +
    "this is a demo response from Muse's built-in mock model — no `OPENAI_API_KEY` is set, so the app streams a canned answer to show the full experience.\n\n" +
    "- The streaming pipeline, persistence, and UI are all real.\n" +
    "- Add an OpenAI key to `.env` and you'll get genuine model output through the exact same code path.\n\n" +
    "Ask me anything else to see another stream.";

  // Stream word-by-word with small delays to emulate token streaming.
  const tokens = reply.split(/(\s+)/);
  for (const tok of tokens) {
    await new Promise((r) => setTimeout(r, 18));
    yield tok;
  }
}
