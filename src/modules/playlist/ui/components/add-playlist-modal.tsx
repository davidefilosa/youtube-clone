"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface AddPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const AddPlaylistModal = ({
  open,
  onOpenChange,
  videoId,
}: AddPlaylistModalProps) => {
  const utils = trpc.useUtils();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.playlist.getManyForVideo.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        videoId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
      }
    );

  const handleOpenChange = (newOpen: boolean) => {
    utils.playlist.getManyForVideo.refetch();
    onOpenChange(newOpen);
  };

  const togglePlaylist = trpc.playlist.addVideo.useMutation({
    onSuccess: () => {
      toast.success("Playlist updated", { id: "playlist" });
      utils.playlist.getMany.invalidate();
      utils.playlist.getManyForVideo.invalidate({ videoId });
    },
    onError: (error) => {
      toast.error("Faild to update playlist", { id: "playlist" });
      console.log(error);
    },
  });

  const onTogglePlaylist = (playlistId: string) => {
    toast.loading("Uploading playlist", { id: "playlist" });
    togglePlaylist.mutate({ videoId, playlistId });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add to playlist"
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          data?.pages.flatMap((page) =>
            page.items.map((playlist) => (
              <Button
                key={playlist.id}
                variant={"ghost"}
                className="w-full justify-start px-2 [&_svg]:size-5"
                size={"lg"}
                onClick={() => onTogglePlaylist(playlist.id)}
              >
                {playlist.containsVideo ? (
                  <SquareCheckIcon className="mr-2" />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                {playlist.name}
              </Button>
            ))
          )}

        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isManual={true}
          />
        )}
      </div>
    </ResponsiveDialog>
  );
};
