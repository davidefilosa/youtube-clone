"use client";

import { CommentForm } from "@/modules/comment/ui/components/comment-form";
import { CommentItem } from "@/modules/comment/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<ComentsSectionSkeletor />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <ComentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ComentsSectionSkeletor = () => {
  return <div>Loading...</div>;
};

const ComentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
  const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId });
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1>{comments.length} comments</h1>
        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <CommentItem key={comment.comments.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};
