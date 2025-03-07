import { cn, formatDuration } from "@/lib/utils";
import Image from "next/image";
import { format } from "path";
import React from "react";
import { THUMBNAIL_FALLBACK } from "../../costants";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoThumbnailProps {
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  title: string;
  duration: number;
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

export const VideoThumbnail = ({
  thumbnailUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden transition-all duration-300 rounded-xl aspect-video">
        <Image
          src={thumbnailUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className={cn(
            "size-full object-cover",
            previewUrl && "opacity-100 group-hover:opacity-0"
          )}
        />
        {previewUrl && (
          <Image
            unoptimized
            src={previewUrl ?? "/placeholder.svg"}
            alt={title}
            fill
            className="size-full object-cover opacity-0 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
