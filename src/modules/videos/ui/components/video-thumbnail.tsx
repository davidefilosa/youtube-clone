import Image from "next/image";
import React from "react";

interface VideoThumbnailProps {
  thumbnailUrl?: string | null;
}

export const VideoThumbnail = ({ thumbnailUrl }: VideoThumbnailProps) => {
  return (
    <div className="relative">
      <div className="relative w-full overflow-hidden transition-all rounded-xl aspect-video">
        <Image
          src={thumbnailUrl ?? "/placeholder.svg"}
          alt="Thumbnail"
          fill
          className="size-full object-cover"
        />
      </div>
    </div>
  );
};
