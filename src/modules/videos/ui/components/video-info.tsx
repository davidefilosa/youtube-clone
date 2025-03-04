import React, { useMemo } from "react";
import { VideoGetManyOutput } from "../../types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/user/ui/components/user-info";
import { VideoMenu } from "./video-menu";

interface VideoInfoProps {
  video: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoInfo = ({ video, onRemove }: VideoInfoProps) => {
  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(video.likes);
  }, [video.views]);

  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(video.views);
  }, [video.views]);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true });
  }, [video.createdAt]);

  return (
    <div className="flex gap-3">
      <Link href={`/users/${video.user.id}`}>
        <UserAvatar
          size={"sm"}
          imageUrl={video.user.imageUrl}
          name={video.user.name}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/videos/${video.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {video.title}
          </h3>
        </Link>
        <Link href={`/users/${video.user.id}`}>
          <UserInfo size={"sm"} name={video.user.name} />
        </Link>
        <Link href={`/videos/${video.id}`}>
          <p className="text-xs text-gray-600 line-clamp-1">
            {compactViews} views &#x2022; {compactDate}
          </p>
        </Link>
      </div>
      <div className="flex-shrink-0">
        <VideoMenu videoId={video.id} variant="ghost" />
      </div>
    </div>
  );
};
