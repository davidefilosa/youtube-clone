import { db } from "@/db";
import {
  usersTable,
  videoUpdateSchema,
  videoViews,
  videos,
  videoReactions,
  subscriptions,
  playlists,
  playlistVideos,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  lt,
  or,
} from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const playlistRouter = createTRPCRouter({
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), viewedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const viewerVideosViews = db.$with("viewer_videos_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      );

      const data = await db
        .with(viewerVideosViews)
        .select({
          ...getTableColumns(videos),
          user: { ...getTableColumns(usersTable) },
          viewedAt: viewerVideosViews.viewedAt,
          views: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(usersTable, eq(videos.userId, usersTable.id))
        .innerJoin(viewerVideosViews, eq(viewerVideosViews.videoId, videos.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideosViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideosViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideosViews.viewedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, viewedAt: lastItem.viewedAt }
        : null;
      return { items, nextCursor };
    }),

  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), likedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const viewerVideosLiked = db.$with("viewer_videos_liked").as(
        db
          .select({
            videoId: videoReactions.videoId,
            likedAt: videoReactions.updatedAt,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.type, "like")
            )
          )
      );

      const data = await db
        .with(viewerVideosLiked)
        .select({
          ...getTableColumns(videos),
          user: { ...getTableColumns(usersTable) },
          likedAt: viewerVideosLiked.likedAt,
          views: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(usersTable, eq(videos.userId, usersTable.id))
        .innerJoin(viewerVideosLiked, eq(viewerVideosLiked.videoId, videos.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideosLiked.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideosLiked.likedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideosLiked.likedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, likedAt: lastItem.likedAt }
        : null;
      return { items, nextCursor };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;
      const { id: userId } = ctx.user;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (!name) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [newPlaylist] = await db
        .insert(playlists)
        .values({ name, userId })
        .returning();

      return newPlaylist;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), createdAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videosCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: usersTable,
        })
        .from(playlists)
        .innerJoin(usersTable, eq(playlists.userId, usersTable.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.createdAt, cursor.createdAt),
                  and(
                    eq(playlists.createdAt, cursor.createdAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.createdAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, createdAt: lastItem.createdAt }
        : null;
      return { items, nextCursor };
    }),
});
