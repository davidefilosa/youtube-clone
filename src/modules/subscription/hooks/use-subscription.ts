import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { error } from "console";

interface useSubscriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubscription = ({
  userId,
  isSubscribed,
  fromVideoId,
}: useSubscriptionProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: fromVideoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const unSubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: fromVideoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = subscribe.isPending || unSubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unSubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  return { isPending, onClick };
};
