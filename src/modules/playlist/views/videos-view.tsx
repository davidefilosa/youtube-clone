import { VideosSection } from "../sections/videos-section";
import { RemovePlaylistModal } from "../ui/components/remove-playlist-modal";

interface VideosViewProps {
  playlistId: string;
}

export const VideosView = ({ playlistId }: VideosViewProps) => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Custom list</h1>
          <p className="text-xs text-muted-foreground">
            Video from your playlist
          </p>
        </div>
        <RemovePlaylistModal playlistId={playlistId} />
      </div>
      <VideosSection playlistId={playlistId} />
    </div>
  );
};
