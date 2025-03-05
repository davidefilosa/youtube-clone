import { db } from "@/db";
import {
  usersTable,
  videoUpdateSchema,
  videoViews,
  videos,
  videoReactions,
  subscriptions,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { boolean } from "drizzle-orm/mysql-core";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        mp4_support: "standard",
        input: [
          {
            generated_subtitles: [{ language_code: "en", name: "English" }],
          },
        ],
      },
      cors_origin: "*", // in a real app, this should be the domain of your app
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return { video: video, url: upload.url };
  }),

  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing video id",
        });
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return updatedVideo;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const [video] = await db
        .delete(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)))
        .returning();

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing video id",
        });
      }

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      if (video.thumbnailKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(video.thumbnailKey);
        await db
          .update(videos)
          .set({ thumbnailUrl: null, thumbnailKey: null })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }

      if (!video.muxPlaybackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mux playbackId not found",
        });
      }

      const thumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl: thumbnailUrl,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
  generateTitle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const videoId = input.id;
      const { workflowRunId } = await workflow.trigger({
        url: "http://localhost:3000/api/videos/workflows/title",
        body: { userId, videoId },
      });
      return { workflowRunId };
    }),
  generateDescription: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const videoId = input.id;
      const { workflowRunId } = await workflow.trigger({
        url: "http://localhost:3000/api/videos/workflows/description",
        body: { userId, videoId },
      });
      return { workflowRunId };
    }),
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string(), prompt: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const videoId = input.id;
      const { workflowRunId } = await workflow.trigger({
        url: "http://localhost:3000/api/videos/workflows/thumbnail",
        body: { userId, videoId, prompt: input.prompt },
      });
      return { workflowRunId };
    }),
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
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
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({
            viewerId: subscriptions.viewerId,
            creatorId: subscriptions.creatorId,
          })
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );

      const [video] = await db
        .with(viewerReactions, viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(usersTable),
            viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ),
            subscriberCoun: db.$count(
              subscriptions,
              eq(usersTable.id, subscriptions.creatorId)
            ),
          },
          videoViews: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          viewerReaction: viewerReactions.type,
        })
        .from(videos)
        .innerJoin(usersTable, eq(videos.userId, usersTable.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, usersTable.id)
        )
        .where(eq(videos.id, id));

      if (!video) {
        throw new TRPCError({ message: "Video not found", code: "NOT_FOUND" });
      }
      return video;
    }),
  revalidate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing video id",
        });
      }

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      if (!video.muxUploadId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mux upload id  not found",
        });
      }
      const directUpload = await mux.video.uploads.retrieve(video.muxUploadId);

      if (!directUpload || !directUpload.asset_id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mux upload id  not found",
        });
      }

      const asset = await mux.video.assets.retrieve(directUpload.asset_id);

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mux upload id  not found",
        });
      }
      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: asset.playback_ids?.[0].id,
          muxAssetId: asset.id,
          duration: asset.duration ? Math.round(asset.duration * 1000) : 0,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
});
