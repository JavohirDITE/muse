export const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini", hint: "Fast & cheap" },
  { value: "gpt-4o", label: "GPT-4o", hint: "Most capable" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 mini", hint: "Balanced" },
];

export const PERSONA_EMOJIS = [
  "✨",
  "🧠",
  "🚀",
  "📚",
  "🎨",
  "🧑‍💻",
  "🔬",
  "💡",
  "⚖️",
  "🩺",
];

export const AVATAR_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#ec4899",
  "#06b6d4",
  "#22c55e",
  "#f97316",
];

export const STARTER_PERSONAS = [
  {
    name: "Code Reviewer",
    emoji: "🧑‍💻",
    description: "Reviews code for bugs, clarity and best practices.",
    systemPrompt:
      "You are a meticulous senior software engineer. Review code for correctness, security, readability and performance. Be specific and suggest concrete improvements with short examples.",
  },
  {
    name: "Product Strategist",
    emoji: "🚀",
    description: "Sharpens product ideas and roadmaps.",
    systemPrompt:
      "You are a pragmatic product strategist. Help shape ideas into crisp problem statements, prioritize ruthlessly, and surface risks. Ask clarifying questions when scope is vague.",
  },
];
