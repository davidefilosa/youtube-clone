import { db } from "@/db";
import { comments, usersTable, videos } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, desc, or, lt, getTableColumns, count } from "drizzle-orm";
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
    .input(
      z.object({
        videoId: z.string(),
        cursor: z
          .object({ videoId: z.string(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;
      const [totlaData] = await db
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.videoId, videoId));

      const data = await db
        .select({
          ...getTableColumns(comments),
          user: usersTable,
        })
        .from(comments)
        .innerJoin(usersTable, eq(comments.userId, usersTable.id))
        .where(
          and(
            eq(comments.videoId, videoId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.videoId, cursor.videoId)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(comments.createdAt), desc(comments.videoId))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { videoId: lastItem.videoId, updatedAt: lastItem.updatedAt }
        : null;
      return { items, nextCursor, totlaCount: totlaData.count };
    }),
});
