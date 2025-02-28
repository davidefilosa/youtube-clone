import React from "react";
import { VideoGetOneOutput } from "../../types";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SubscriptionButton } from "@/modules/subscription/ui/components/subscription-button";
import { UserInfo } from "@/modules/user/ui/components/user-info";
import { useSubscription } from "@/modules/subscription/hooks/use-subscription";
interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
}
export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId, isLoaded } = useAuth();

  const { onClick, isPending } = useSubscription({
    userId: user.id,
    fromVideoId: videoId,
    isSubscribed: user.viewerSubscribed,
  });

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size={"lg"} imageUrl={user.imageUrl} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo name={user.name} size={"lg"} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subscriberCoun} subscribers
            </span>
          </div>
        </div>
      </Link>
      {userId === user.clerkId ? (
        <Button asChild className="rounded-full" variant={"secondary"}>
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          disabled={isPending || !isLoaded}
          isSubscibed={user.viewerSubscribed}
          size={"default"}
        />
      )}
    </div>
  );
};
