"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import React, { useMemo } from "react";

interface PlaylistThumbnailProps {
  imageUrl?: string | null;
  title: string;
  videosCount: number;
  className?: string;
}

export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative pt-3 group">
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl bg-black/20 aspect-video" />
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video" />
        <div className="relative overflow-hidden rounded-xl w-full aspect-video">
          <Skeleton className="size-full" />
        </div>
      </div>
    </div>
  );
};

export const PlaylistThumbnail = ({
  imageUrl,
  title,
  videosCount,
  className,
}: PlaylistThumbnailProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(videosCount);
  }, [videosCount]);

  return (
    <div className={cn("relative pt-3 group", className)}>
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl bg-black/20 aspect-video" />
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video" />

        <div className="relative overflow-hidden rounded-xl w-full aspect-video">
          <Image
            src={imageUrl || "/placeholder.svg"}
            fill
            className="object-cover"
            alt={title}
          />

          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 text-white fill-white" />
              <span className="text-white font-medium">Play all</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium flex items-center gap-x-1">
        <ListVideoIcon className="size-4" />
        {compactViews} videos
      </div>
    </div>
  );
};
