import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistGetManyOutput } from "@/modules/playlist/types";
import React from "react";

interface PlaylistInfoProps {
  playlist: PlaylistGetManyOutput["items"][number];
}

export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 ">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-52" />
    </div>
  );
};

export const PlaylistInfo = ({ playlist }: PlaylistInfoProps) => {
  return (
    <div className="flex gap-3 ">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words">
          {playlist.name}
        </h3>
        <p className="text-sm text-muted-foreground">Playlist</p>
        <p className="text-sm text-muted-foreground font-semibold hover:text-primary">
          View full playlist
        </p>
      </div>
    </div>
  );
};
