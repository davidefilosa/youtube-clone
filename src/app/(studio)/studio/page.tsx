import { DEFAULT_LIMIT } from "@/constants";
import { StudioView } from "@/modules/studio/view/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

const StudioPage = async () => {
  void trpc.studio.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });
  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default StudioPage;
