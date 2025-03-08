"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { PlaylistGridCard } from "../ui/components/playlist-grid-card";
import { PlaylistThumbnailSkeleton } from "../ui/components/playlist-grid-card/playlist-thumbnail";
import { PlaylistInfoSkeleton } from "../ui/components/playlist-grid-card/playlist-info";

export const PlaylistSection = () => {
  return (
    <Suspense fallback={<PlaylistSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <PlaylistSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 gap-4 gap-y-10 ">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2 w-full">
          <PlaylistThumbnailSkeleton />
          <PlaylistInfoSkeleton />
        </div>
      ))}
    </div>
  );
};

const PlaylistSectionSuspense = () => {
  const isMobile = useIsMobile();
  const [playlists, query] = trpc.playlist.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 gap-4 gap-y-10 ">
        {playlists.pages
          .flatMap((page) => page.items)
          .map((playlist) => (
            <PlaylistGridCard key={playlist.id} playlist={playlist} />
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
