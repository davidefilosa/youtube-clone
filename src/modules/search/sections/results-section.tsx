"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface ResultsSectionProps {
  categoryId?: string;
  query?: string;
}

export const ResultsSection = ({ categoryId, query }: ResultsSectionProps) => {
  return (
    <Suspense fallback={<ResulsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <ResulsSectionSuspense categoryId={categoryId} query={query} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ResulsSectionSkeleton = () => {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {Array.from({ length: 5 }).map((_, index) => (
            <VideoGridCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <VideoRowCardSkeleton key={index} size={"default"} />
          ))}
        </div>
      )}
    </>
  );
};

const ResulsSectionSuspense = ({ categoryId, query }: ResultsSectionProps) => {
  const isMobile = useIsMobile();
  const [videos, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      categoryId,
      query,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {videos.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoGridCard video={video} key={video.id} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoRowCard video={video} key={video.id} size={"default"} />
            ))}
        </div>
      )}
      <InfiniteScroll
        hasNextPage={resultQuery.hasNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
      />
    </>
  );
};
