import { DEFAULT_LIMIT } from "@/constants";
import { HistoryView } from "@/modules/playlist/views/history-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

const HistoryPage = () => {
  void trpc.playlist.getHistory.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  );
};

export default HistoryPage;
