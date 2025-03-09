import { PlaylistGetManyOutput } from "@/modules/playlist/types";
import Link from "next/link";
import { PlaylistThumbnail } from "./playlist-thumbnail";
import { PlaylistInfo } from "./playlist-info";

interface PlaylistGridCardProps {
  playlist: PlaylistGetManyOutput["items"][number];
}
export const PlaylistGridCard = ({ playlist }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${playlist.id}`}>
      <div className="flex flex-col gap-2 w-full group">
        <PlaylistThumbnail
          imageUrl={playlist.thumbnailUrl}
          title={playlist.name}
          videosCount={playlist.videosCount}
        />
        <PlaylistInfo playlist={playlist} />
      </div>
    </Link>
  );
};
