"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { CreatePlaylistModal } from "../ui/components/create-playlist-modal";
import { PlaylistSection } from "../sections/playlist-section";

export const PlaylistsView = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <CreatePlaylistModal open={open} onOpenChange={setOpen} />
      <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Playlists</h1>
            <p className="text-xs text-muted-foreground">
              Collections you have created
            </p>
          </div>
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <PlusIcon />
          </Button>
        </div>
        <PlaylistSection />
      </div>
    </>
  );
};
