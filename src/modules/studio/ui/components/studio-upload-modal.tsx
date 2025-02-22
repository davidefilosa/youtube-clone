"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";

export const StudioUploadModal = () => {
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created", { id: "create-video" });
      utils.studio.getMany.invalidate();
    },
    onError: (e) => {
      toast.error("Failed to create video", { id: "create-video" });

      console.log(e);
    },
  });
  return (
    <>
      <ResponsiveDialog
        title="Upload a video"
        open={!!create.data}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} />
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </ResponsiveDialog>
      <Button
        variant={"secondary"}
        onClick={() => {
          toast.loading("Creating video...", { id: "create-video" });
          create.mutate();
        }}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <PlusIcon />
        )}
        Create
      </Button>
    </>
  );
};
