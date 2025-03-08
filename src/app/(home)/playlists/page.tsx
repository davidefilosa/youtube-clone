import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistsView } from "@/modules/playlist/views/playlist-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

const PlaylistsPage = () => {
  void trpc.playlist.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
};

export default PlaylistsPage;
