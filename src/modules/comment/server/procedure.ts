import { db } from "@/db";
import { comments, usersTable, videos } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string(), value: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId, value } = input;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, videoId)));

      if (!existingVideo) {
        throw new TRPCError({
          message: "Failed to create comment",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const [comment] = await db
        .insert(comments)
        .values({ videoId, userId, value })
        .returning();

      if (!comment) {
        throw new TRPCError({
          message: "Failed to create comment",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      return comment;
    }),

  getMany: baseProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      const { videoId } = input;
      const data = await db
        .select()
        .from(comments)
        .innerJoin(usersTable, eq(comments.userId, usersTable.id))
        .where(eq(comments.videoId, videoId))
        .orderBy(desc(comments.createdAt));

      return data;
    }),
});
