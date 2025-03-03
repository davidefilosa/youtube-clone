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
  isNull,
  isNotNull,
} from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        value: z.string().min(1),
        parentId: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId, value, parentId } = input;

      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [comment] = await db
        .insert(comments)
        .values({ videoId, userId, value, parentId })
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
        parentId: z.string().nullish(),
        cursor: z
          .object({
            videoId: z.string(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit, parentId } = input;
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

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );

      const [totalData, data] = await Promise.all([
        db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.videoId, videoId)),
        db
          .with(viewerReactions, replies)
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
            replyCount: replies.count,
          })
          .from(comments)
          .innerJoin(usersTable, eq(comments.userId, usersTable.id))
          .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
          .leftJoin(replies, eq(comments.id, replies.parentId))
          .where(
            and(
              eq(comments.videoId, videoId),
              parentId
                ? eq(comments.parentId, parentId)
                : isNull(comments.parentId),
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
