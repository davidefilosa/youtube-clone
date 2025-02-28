import { db } from "@/db";
import { videoViews } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const [existingVideoViews] = await db
        .select()
        .from(videoViews)
        .where(
          and(eq(videoViews.videoId, videoId), eq(videoViews.userId, userId))
        );

      if (existingVideoViews) {
        return existingVideoViews;
      }

      const [videoView] = await db
        .insert(videoViews)
        .values({ videoId, userId })
        .returning();

      if (!videoView) {
        throw new TRPCError({
          message: "Failed to create video view",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      return videoId;
    }),
});
