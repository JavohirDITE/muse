import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@/server/trpc";

async function ownPersona(
  db: import("@prisma/client").PrismaClient,
  personaId: string,
  userId: string,
) {
  const persona = await db.persona.findUnique({
    where: { id: personaId },
    select: { userId: true },
  });
  if (!persona) throw new TRPCError({ code: "NOT_FOUND" });
  if (persona.userId !== userId) throw new TRPCError({ code: "FORBIDDEN" });
}

export const personaRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.persona.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { knowledge: true, conversations: true } } },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const persona = await ctx.db.persona.findUnique({
        where: { id: input.id },
        include: { knowledge: { orderBy: { createdAt: "desc" } } },
      });
      if (!persona) throw new TRPCError({ code: "NOT_FOUND" });
      if (persona.userId !== ctx.session.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      return persona;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(60),
        emoji: z.string().max(8).default("✨"),
        description: z.string().max(200).optional(),
        systemPrompt: z.string().min(1).max(4000),
        model: z.string().default("gpt-4o-mini"),
        temperature: z.number().min(0).max(2).default(0.7),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.persona.create({
        data: { ...input, userId: ctx.session.userId },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(60).optional(),
        emoji: z.string().max(8).optional(),
        description: z.string().max(200).nullable().optional(),
        systemPrompt: z.string().min(1).max(4000).optional(),
        model: z.string().optional(),
        temperature: z.number().min(0).max(2).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ownPersona(ctx.db, input.id, ctx.session.userId);
      const { id, ...data } = input;
      return ctx.db.persona.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ownPersona(ctx.db, input.id, ctx.session.userId);
      await ctx.db.persona.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  addKnowledge: protectedProcedure
    .input(
      z.object({ personaId: z.string(), content: z.string().min(1).max(4000) }),
    )
    .mutation(async ({ ctx, input }) => {
      await ownPersona(ctx.db, input.personaId, ctx.session.userId);
      return ctx.db.knowledgeChunk.create({
        data: { personaId: input.personaId, content: input.content },
      });
    }),

  removeKnowledge: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const chunk = await ctx.db.knowledgeChunk.findUnique({
        where: { id: input.id },
        include: { persona: { select: { userId: true } } },
      });
      if (!chunk) throw new TRPCError({ code: "NOT_FOUND" });
      if (chunk.persona.userId !== ctx.session.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      await ctx.db.knowledgeChunk.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
