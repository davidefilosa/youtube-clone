import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/view/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

interface PagePros {
  params: Promise<{ videoId: string }>;
}
const VideoIdPage = async ({ params }: PagePros) => {
  const { videoId } = await params;
  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default VideoIdPage;
