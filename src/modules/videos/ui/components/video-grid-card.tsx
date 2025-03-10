import React from "react";
import { VideoGetManyOutput } from "../../types";
import Link from "next/link";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";

interface VideoGridCardProps {
  video: VideoGetManyOutput["items"][number];
  onRemove?: (videoId: string) => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

export const VideoGridCard = ({ video, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link href={`/videos/${video.id}`}>
        <VideoThumbnail
          thumbnailUrl={video.thumbnailUrl}
          previewUrl={video.previewUrl}
          title={video.title}
          duration={video.duration}
        />
      </Link>
      <VideoInfo video={video} onRemove={onRemove} />
    </div>
  );
};
