import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface SubscriptionButtonProps {
  onClick: ButtonProps["onClick"];
  disabled: boolean;
  isSubscibed: boolean;
  className?: string;
  size: ButtonProps["size"];
}

export const SubscriptionButton = ({
  onClick,
  disabled,
  isSubscibed,
  className,
  size,
}: SubscriptionButtonProps) => {
  return (
    <Button
      size={size}
      className={cn("rounded-full", className)}
      disabled={disabled}
      onClick={onClick}
      variant={isSubscibed ? "secondary" : "default"}
    >
      {isSubscibed ? "Subscribed" : "Subscribe"}
    </Button>
  );
};
