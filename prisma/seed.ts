import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Muse…");
  const passwordHash = await bcrypt.hash("password123", 12);

  const demo = await db.user.upsert({
    where: { email: "demo@muse.app" },
    update: {},
    create: {
      email: "demo@muse.app",
      name: "Demo User",
      passwordHash,
      avatarColor: "#8b5cf6",
    },
  });

  const reviewer = await db.persona.create({
    data: {
      userId: demo.id,
      name: "Code Reviewer",
      emoji: "🧑‍💻",
      description: "Reviews code for bugs, clarity and best practices.",
      systemPrompt:
        "You are a meticulous senior software engineer. Review code for correctness, security, readability and performance. Be specific and suggest concrete improvements.",
      model: "gpt-4o-mini",
      knowledge: {
        create: [
          {
            content:
              "Team convention: all React components must be typed with explicit prop interfaces; no implicit any. Prefer composition over inheritance.",
          },
          {
            content:
              "Team convention: database access goes through the repository layer only; never call the ORM directly from route handlers.",
          },
        ],
      },
    },
  });

  await db.persona.create({
    data: {
      userId: demo.id,
      name: "Product Strategist",
      emoji: "🚀",
      description: "Sharpens product ideas and roadmaps.",
      systemPrompt:
        "You are a pragmatic product strategist. Turn ideas into crisp problem statements, prioritize ruthlessly, and surface risks.",
      model: "gpt-4o-mini",
    },
  });

  const convo = await db.conversation.create({
    data: {
      userId: demo.id,
      personaId: reviewer.id,
      title: "How should I structure error handling?",
    },
  });
  await db.message.createMany({
    data: [
      {
        conversationId: convo.id,
        role: "USER",
        content: "How should I structure error handling in my API?",
      },
      {
        conversationId: convo.id,
        role: "ASSISTANT",
        content:
          "Great question. A few principles:\n\n1. **Fail fast at the edges** — validate input with a schema (e.g. Zod) before any logic runs.\n2. **Use typed errors** — model expected failures explicitly rather than throwing strings.\n3. **Centralize the mapping** to HTTP responses so handlers stay clean.",
      },
    ],
  });

  console.log("✅ Seeded 2 personas, a knowledge base and a sample chat.");
  console.log("→ Sign in with demo@muse.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
