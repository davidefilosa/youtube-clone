"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { toast } from "sonner";

interface VideosSectionProps {
  playlistId: string;
}

export const VideosSection = ({ playlistId }: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideosSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosSectionSkeleton = () => {
  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="hidden flex-col gap-4 gap-y-10 md:flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size={"compact"} />
        ))}
      </div>
    </>
  );
};

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  const isMobile = useIsMobile();
  const utils = trpc.useUtils();
  const [videos, query] = trpc.playlist.getVideos.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      playlistId,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const togglePlaylist = trpc.playlist.addVideo.useMutation({
    onSuccess: () => {
      toast.success("Playlist updated", { id: "playlist" });
      utils.playlist.getMany.invalidate();
      utils.playlist.getVideos.invalidate();
    },
    onError: (error) => {
      toast.error("Faild to update playlist", { id: "playlist" });
      console.log(error);
    },
  });

  const onRemove = (videoId: string) => {
    toast.loading("Uploading playlist", { id: "playlist" });
    togglePlaylist.mutate({ videoId, playlistId });
  };

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard
              video={video}
              key={video.id}
              onRemove={() => onRemove(video.id)}
            />
          ))}
      </div>
      <div className="hidden flex-col gap-4  md:flex">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard
              video={video}
              key={video.id}
              size={"compact"}
              onRemove={() => onRemove(video.id)}
            />
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
