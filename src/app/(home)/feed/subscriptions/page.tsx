import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionsView } from "@/modules/home/ui/view/subscriptions-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

const SubscriptionsPage = () => {
  void trpc.categories.getMany.prefetch();
  void trpc.videos.getManySubsciber.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
};

export default SubscriptionsPage;
