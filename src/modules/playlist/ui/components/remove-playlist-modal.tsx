"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface RemovePlaylistModalProps {
  playlistId: string;
}

export const RemovePlaylistModal = ({
  playlistId,
}: RemovePlaylistModalProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const removePlaylist = trpc.playlist.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted", { id: "playlist" });
      utils.playlist.getMany.invalidate();
      router.push("/playlists");
    },
    onError: (error) => {
      toast.error("Faild to delete playlist", { id: "playlist" });
      console.log(error);
    },
  });

  const onRemove = () => {
    toast.loading("Deleting playlist", { id: "playlist" });
    removePlaylist.mutate({ playlistId });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={"ghost"} className="rounded-full" size={"icon"}>
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            playlist and the saved videos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRemove}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
