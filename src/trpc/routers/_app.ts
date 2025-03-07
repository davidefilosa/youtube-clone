import { categoriesRouter } from "@/modules/category/server/procedures";
import { createTRPCRouter } from "../init";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedure";
import { videoViewsRouter } from "@/modules/video-views/server/procedure";
import { videoReactionRouter } from "@/modules/reaction/server/procedure";
import { subscriptionsRouter } from "@/modules/subscription/server/procedure";
import { commentsRouter } from "@/modules/comment/server/procedure";
import { commentReactionRouter } from "@/modules/comment-reactions/server/procedure";
import { suggestionsRouter } from "@/modules/suggestions/server/procedures";
import { searchRouter } from "@/modules/search/server/procedures";
import { playlistRouter } from "@/modules/playlist/server/procedure";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReaction: videoReactionRouter,
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
  commentReaction: commentReactionRouter,
  suggestions: suggestionsRouter,
  search: searchRouter,
  playlist: playlistRouter,
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
