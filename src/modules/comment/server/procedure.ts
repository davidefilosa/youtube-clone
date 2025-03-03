import { db } from "@/db";
import { commentReactions, comments, usersTable, videos } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  eq,
  desc,
  or,
  lt,
  getTableColumns,
  count,
  inArray,
} from "drizzle-orm";
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
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit } = input;
      const { clerkUserId } = ctx;

      let userId;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) userId = user.id;

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      const [totalData, data] = await Promise.all([
        db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.videoId, videoId)),
        db
          .with(viewerReactions)
          .select({
            ...getTableColumns(comments),
            user: usersTable,
            likeCount: db.$count(
              commentReactions,
              and(
                eq(comments.id, commentReactions.commentId),
                eq(commentReactions.type, "like")
              )
            ),
            dislikeCount: db.$count(
              commentReactions,
              and(
                eq(comments.id, commentReactions.commentId),
                eq(commentReactions.type, "dislike")
              )
            ),
            viewerReaction: viewerReactions.type,
          })
          .from(comments)
          .innerJoin(usersTable, eq(comments.userId, usersTable.id))
          .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
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
          .limit(limit + 1),
      ]);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { videoId: lastItem.videoId, updatedAt: lastItem.updatedAt }
        : null;
      return { items, nextCursor, totlaCount: totalData[0].count };
    }),
  remove: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;
      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.userId, userId), eq(comments.id, commentId)))
        .returning();

      return deletedComment;
    }),
});
