import React from "react";
import { CommentsGetManyOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface CommentItepmProps {
  comment: CommentsGetManyOutput["items"][number];
}

export const CommentItem = ({ comment }: CommentItepmProps) => {
  return (
    <div className="flex gap-4">
      <Link href={`/users/${comment.user.id}`}>
        <UserAvatar
          size={"lg"}
          imageUrl={comment.user.imageUrl || "/placeholder.svg"}
          name={comment.user.name}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/users/${comment.user.id}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-sm pb-0.5">
              {comment.user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, {
                addSuffix: true,
              })}
            </span>
          </div>
        </Link>
        <p className="text-sm">{comment.value}</p>
      </div>
    </div>
  );
};
