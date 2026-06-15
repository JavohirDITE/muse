import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@/server/trpc";

export const conversationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.conversation.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { updatedAt: "desc" },
      include: {
        persona: { select: { id: true, name: true, emoji: true } },
        _count: { select: { messages: true } },
      },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const convo = await ctx.db.conversation.findUnique({
        where: { id: input.id },
        include: {
          persona: true,
          messages: { orderBy: { createdAt: "asc" } },
        },
      });
      if (!convo) throw new TRPCError({ code: "NOT_FOUND" });
      if (convo.userId !== ctx.session.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      return convo;
    }),

  create: protectedProcedure
    .input(z.object({ personaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const persona = await ctx.db.persona.findUnique({
        where: { id: input.personaId },
        select: { userId: true, name: true },
      });
      if (!persona || persona.userId !== ctx.session.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      return ctx.db.conversation.create({
        data: {
          userId: ctx.session.userId,
          personaId: input.personaId,
          title: "New chat",
        },
      });
    }),

  rename: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string().min(1).max(120) }))
    .mutation(async ({ ctx, input }) => {
      const convo = await ctx.db.conversation.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (!convo || convo.userId !== ctx.session.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      return ctx.db.conversation.update({
        where: { id: input.id },
        data: { title: input.title },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const convo = await ctx.db.conversation.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (!convo || convo.userId !== ctx.session.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      await ctx.db.conversation.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
