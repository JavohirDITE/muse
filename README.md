<div align="center">

# ✨ Muse

**Your own AI assistant studio.**

Design assistants with their own prompts and knowledge, then chat with fast,
streaming responses. Works with the OpenAI API — or a built-in mock model when
no key is set.

[Stack](#stack) · [Features](#features) · [How streaming works](#how-streaming-works) · [Getting started](#getting-started)

</div>

---

## Stack

| Layer        | Tech                                                       |
| ------------ | ---------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, React 19)                      |
| Language     | **TypeScript** (strict, end-to-end)                        |
| CRUD API     | **tRPC v11** + **Zod**                                     |
| Streaming    | **Route Handler** + `ReadableStream` (token streaming)     |
| AI           | **OpenAI SDK** with a dependency-free mock fallback        |
| Data         | **Prisma 6** + **PostgreSQL**                              |
| UI           | **Tailwind v4**, **Framer Motion**, **react-markdown**     |
| Auth         | **jose** (JWT) + **bcrypt**, httpOnly cookie sessions      |
| Tooling      | **Docker**, **GitHub Actions** CI                          |

## Features

- **Custom personas** — each assistant has its own system prompt, model and
  temperature. Switch between them per conversation.
- **Lightweight RAG** — attach a knowledge base to a persona; the most relevant
  snippets are retrieved (keyword scoring) and injected into the prompt.
- **Real token streaming** — responses stream over a `ReadableStream`, render as
  markdown live with a typing caret, and are persisted when complete.
- **Mock model fallback** — without `OPENAI_API_KEY`, Muse streams a canned
  response through the exact same pipeline, so the app is fully demoable.
- **Saved conversations** — every thread is stored, auto-titled from the first
  message, and full history is fed back as context.
- **Ownership checks** — every persona, chat and message is scoped to its owner
  on the server.

## How streaming works

```
client  ──POST /api/chat { conversationId, content }──▶  route handler
                                                          │ save user message
                                                          │ retrieve knowledge (RAG)
                                                          │ build messages
                                                          ▼
client  ◀───────── ReadableStream of text deltas ────────  streamCompletion()
   │  render markdown live                                  (OpenAI or mock)
   ▼                                                        │ on finish:
append final assistant message                              └ persist reply
```

The same `streamCompletion()` async generator backs both OpenAI and the mock
model, so the streaming, persistence and UI code paths are identical either way.

## Architecture

```
src/
├─ app/
│  ├─ page.tsx · login · register
│  ├─ studio/                       # guarded app (session check in layout)
│  │  ├─ page.tsx                   # home / new chat
│  │  ├─ c/[conversationId]/        # chat view (streaming)
│  │  └─ personas/                  # list + [id] editor with knowledge base
│  └─ api/
│     ├─ trpc/[trpc]/               # CRUD API
│     └─ chat/                      # streaming chat endpoint
├─ server/routers/                  # auth · persona · conversation
├─ lib/ai.ts                        # retrieval, prompt building, streaming
└─ components/                      # ui · studio
prisma/schema.prisma                # User · Persona · KnowledgeChunk · Conversation · Message
```

## Getting started

> Requires Node 22+ and Docker.

```bash
npm install
docker compose up -d          # Postgres on :5434
cp .env.example .env          # set AUTH_SECRET; OPENAI_API_KEY optional
npm run db:push
npm run db:seed
npm run dev
```

Sign in with the seeded account:

```
email:    demo@muse.app
password: password123
```

> No OpenAI key? Leave `OPENAI_API_KEY` empty — Muse streams from its built-in
> mock model. Add a key for real model output through the same code path.

### Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Dev server                           |
| `npm run build`    | `prisma generate` + production build |
| `npm run db:push`  | Sync schema to the database          |
| `npm run db:seed`  | Seed personas + a sample chat        |
| `npm run lint`     | ESLint                               |

---

<div align="center">
A portfolio project. Built with Next.js, tRPC, Prisma & the OpenAI API.
</div>
