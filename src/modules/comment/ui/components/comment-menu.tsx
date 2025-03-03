import { Button } from "@/components/ui/button";
import { MessageSquareIcon, MoreVertical, TrashIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/client";

interface CommentMenuProps {
  commentId: string;
  videoId: string;
  isAuthor: boolean;
  setIsReplyOpen: (isReplyOpen: boolean) => void;
  variant?: "reply" | "comment";
}

export const CommentMenu = ({
  commentId,
  videoId,
  isAuthor,
  setIsReplyOpen,
  variant,
}: CommentMenuProps) => {
  const utils = trpc.useUtils();
  const deleteComment = trpc.comments.remove.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
    },
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full" size={"icon"} variant={"ghost"}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {variant === "comment" && (
          <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
            <MessageSquareIcon />
            Replay
          </DropdownMenuItem>
        )}
        {isAuthor && (
          <DropdownMenuItem
            onClick={() => deleteComment.mutate({ commentId })}
            disabled={deleteComment.isPending}
          >
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
