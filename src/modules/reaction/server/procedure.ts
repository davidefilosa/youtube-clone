import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoReactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string(), type: z.enum(["like", "dislike"]) }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId, type } = input;

      const [existingReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId)
          )
        );

      if (existingReaction && existingReaction.type === type) {
        await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId)
            )
          );

        return existingReaction;
      }

      if (existingReaction && existingReaction.type !== type) {
        await db
          .update(videoReactions)
          .set({ type })
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId)
            )
          );

        return existingReaction;
      }

      const [newReaction] = await db
        .insert(videoReactions)
        .values({ videoId, userId, type })
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
