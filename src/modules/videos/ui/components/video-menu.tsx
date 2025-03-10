"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddPlaylistModal } from "@/modules/playlist/ui/components/add-playlist-modal";
import { trpc } from "@/trpc/client";
import {
  ListPlusIcon,
  MoreHorizontalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: (videoId: string) => void;
}

export const VideoMenu = ({ videoId, variant, onRemove }: VideoMenuProps) => {
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);
  const onShare = () => {
    const fullURL = `http://localhost:3000/videos/${videoId}`;
    navigator.clipboard.writeText(fullURL);
    toast.success("Link copied!");
  };

  return (
    <>
      <AddPlaylistModal
        videoId={videoId}
        open={openPlaylistModal}
        onOpenChange={setOpenPlaylistModal}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} className="rounded-full" size={"icon"}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={() => {
              onShare();
            }}
          >
            <ShareIcon className="size-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpenPlaylistModal(true);
            }}
          >
            <ListPlusIcon className="size-4 mr-2" />
            Add to playlist
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem onClick={() => onRemove()}>
              <Trash2Icon className="size-4 mr-2" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
