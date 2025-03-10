import { DEFAULT_LIMIT } from "@/constants";
import { VideosView } from "@/modules/playlist/views/videos-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

interface PlaylistIdPageProps {
  params: Promise<{ playlistId: string }>;
}

const PlaylistIdPage = async ({ params }: PlaylistIdPageProps) => {
  const { playlistId } = await params;
  void trpc.playlist.getVideos.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    playlistId,
  });
  return (
    <HydrateClient>
      <VideosView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default PlaylistIdPage;
