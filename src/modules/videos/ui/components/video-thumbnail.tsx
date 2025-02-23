import Image from "next/image";
import React from "react";

export const VideoThumbnail = () => {
  return (
    <div className="relative">
      <div className="relative w-full overflow-hidden transition-all rounded-xl aspect-video">
        <Image
          src={"/placeholder.svg"}
          alt="Thumbnail"
          fill
          className="size-full object-cover"
        />
      </div>
    </div>
  );
};
