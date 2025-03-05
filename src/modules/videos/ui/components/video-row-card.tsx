import { cva, type VariantProps } from "class-variance-authority";
import { VideoGetManyOutput } from "../../types";
import Link from "next/link";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/user/ui/components/user-info";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VideoMenu } from "./video-menu";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  video: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const VideoRowCardSkeleton = ({
  size,
}: VariantProps<typeof videoRowCardVariants>) => {
  return (
    <div className={videoRowCardVariants({ size })}>
      <div className={thumbnailVariants({ size })}>
        <VideoThumbnailSkeleton />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <div className="flex-1 min-w-0">
            <Skeleton
              className={cn("h-5 w-[40%]", size === "compact" && "h-4 w-[40%]")}
            />
            {size === "default" && (
              <>
                <Skeleton className="h-4 w-[40%] mt-1" />
                <div className="flex items-center gap-2 my-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-[40%]" />
                </div>
              </>
            )}
            {size === "compact" && <Skeleton className="h-4 w-[50%] mt-1" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoRowCard = ({ video, size, onRemove }: VideoRowCardProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(video.views);
  }, [video.views]);

  const defaultViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "standard" }).format(
      video.views
    );
  }, [video.views]);

  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(video.likes);
  }, [video.views]);

  const defaultLikes = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "standard" }).format(
      video.likes
    );
  }, [video.likes]);
  return (
    <div className={videoRowCardVariants({ size })}>
      <Link
        href={`/videos/${video.id}`}
        className={thumbnailVariants({ size })}
      >
        <VideoThumbnail
          thumbnailUrl={video.thumbnailUrl}
          previewUrl={video.previewUrl}
          title={video.title}
          duration={video.duration}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${video.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {video.title}
            </h3>
            {size === "default" && (
              <p className="text-xs text-muted-foreground mt-1">
                {defaultViews} views &#x2022; {defaultLikes} likes
              </p>
            )}

            {size === "default" && (
              <>
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size={"sm"}
                    imageUrl={video.user.imageUrl}
                    name={video.user.name}
                  />
                  <UserInfo size={"sm"} name={video.user.name} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                      {video.description || "No description"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-black/70"
                  >
                    <p>From the video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === "compact" && (
              <UserInfo size={"sm"} name={video.user.name} />
            )}
            {size === "compact" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViews} views &#x2022; {compactLikes} likes
              </p>
            )}
          </Link>
          <VideoMenu videoId={video.id} onRemove={onRemove} variant="ghost" />
        </div>
      </div>
    </div>
  );
};
