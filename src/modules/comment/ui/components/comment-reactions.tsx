import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import React from "react";

interface CommentReactionaProps {
  dislikeCount: number;
  likeCount: number;
  viewerReaction?: "like" | "dislike" | null;
  videoId: string;
  commentId: string;
}

export const CommentReactions = ({
  dislikeCount,
  likeCount,
  viewerReaction,
  videoId,
  commentId,
}: CommentReactionaProps) => {
  const utils = trpc.useUtils();
  const createReaction = trpc.commentReaction.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
    },
  });
  return (
    <div className="flex items-center flex-none">
      <Button
        variant={"secondary"}
        className="rounded-full rounded-r-none gap-2 pr-4"
        onClick={() => createReaction.mutate({ commentId, type: "like" })}
        disabled={createReaction.isPending}
        size={"sm"}
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        <span className="text-black">{likeCount}</span>
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        variant={"secondary"}
        className="rounded-full rounded-l-none pl-3"
        onClick={() => createReaction.mutate({ commentId, type: "dislike" })}
        disabled={createReaction.isPending}
        size={"sm"}
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        <span className="text-black">{dislikeCount}</span>
      </Button>
    </div>
  );
};
