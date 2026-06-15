import { router } from "@/server/trpc";
import { authRouter } from "./auth";
import { personaRouter } from "./persona";
import { conversationRouter } from "./conversation";

export const appRouter = router({
  auth: authRouter,
  persona: personaRouter,
  conversation: conversationRouter,
});

export type AppRouter = typeof appRouter;
