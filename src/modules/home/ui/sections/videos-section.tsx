"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";

interface VideosSectionProps {
  categoryId?: string;
}

export const VideosSection = ({ categoryId }: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideosSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4  [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 gap-4 gap-y-10 ">
      {Array.from({ length: 5 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

const VideosSectionSuspense = ({ categoryId }: VideosSectionProps) => {
  const isMobile = useIsMobile();
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      categoryId,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 gap-4 gap-y-10 ">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard video={video} key={video.id} />
          ))}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
