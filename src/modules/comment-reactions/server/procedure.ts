import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const commentReactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({ commentId: z.string(), type: z.enum(["like", "dislike"]) })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { commentId, type } = input;

      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId)
          )
        );

      if (existingReaction && existingReaction.type === type) {
        await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.commentId, commentId),
              eq(commentReactions.userId, userId)
            )
          );

        return existingReaction;
      }

      if (existingReaction && existingReaction.type !== type) {
        await db
          .update(commentReactions)
          .set({ type })
          .where(
            and(
              eq(commentReactions.commentId, commentId),
              eq(commentReactions.userId, userId)
            )
          );

        return existingReaction;
      }

      const [newReaction] = await db
        .insert(commentReactions)
        .values({ commentId, userId, type })
        .returning();

      if (!newReaction) {
        throw new TRPCError({
          message: "Failed to create video reaction",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      return newReaction;
    }),
});
