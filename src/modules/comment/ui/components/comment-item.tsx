"use client";

import React, { useState } from "react";
import { CommentsGetManyOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CommentMenu } from "./comment-menu";
import { CommentReactions } from "./comment-reactions";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";

interface CommentItepmProps {
  comment: CommentsGetManyOutput["items"][number];
  variant?: "reply" | "comment";
}

export const CommentItem = ({ comment, variant }: CommentItepmProps) => {
  const { userId } = useAuth();
  const isAuthor = userId === comment.user.clerkId;
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const [data, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      videoId: comment.videoId,
      limit: DEFAULT_LIMIT,
      parentId: comment.id,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

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
        <div className="mt-1 flex items-center gap-2">
          <CommentReactions
            viewerReaction={comment.viewerReaction}
            videoId={comment.videoId}
            dislikeCount={comment.dislikeCount}
            likeCount={comment.likeCount}
            commentId={comment.id}
          />
          {variant === "comment" && (
            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-8"
              onClick={() => setIsReplyOpen(true)}
            >
              Reply
            </Button>
          )}
        </div>
        {isReplyOpen && variant === "comment" && (
          <div className="mt-4 pl-14">
            <CommentForm
              videoId={comment.videoId}
              onSuccess={() => {
                setIsReplyOpen(false);
                setIsRepliesOpen(true);
              }}
              parentId={comment.id}
              onCancel={() => {
                setIsReplyOpen(false);
              }}
              variant="reply"
            />
          </div>
        )}
        {comment.replyCount > 0 && variant === "comment" && (
          <div className="pl-14">
            <Button
              variant={"tertiary"}
              size={"sm"}
              className="rounded-full"
              onClick={() => setIsRepliesOpen((current) => !current)}
            >
              {isRepliesOpen ? <ChevronDown /> : <ChevronUp />}
              {comment.replyCount} replies
            </Button>
            {isRepliesOpen && (
              <div className="flex flex-col gap-4 mt-2">
                {data.pages.flatMap((page) =>
                  page.items.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      variant="reply"
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <CommentMenu
        commentId={comment.id}
        videoId={comment.videoId}
        isAuthor={isAuthor}
        setIsReplyOpen={setIsReplyOpen}
        variant={variant}
      />
    </div>
  );
};
