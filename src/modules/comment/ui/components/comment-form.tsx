"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useUser, useClerk } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "reply" | "comment";
  parentId?: string;
}

export const CommentForm = ({
  videoId,
  onSuccess,
  variant = "comment",
  parentId,
  onCancel,
}: CommentFormProps) => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const utils = trpc.useUtils();
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      onSuccess?.();
    },
  });

  const formSchema = commentInsertSchema.omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId,
      parentId,
      value: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      openSignIn();
    }
    createComment.mutate(values);
  };

  const handlecancel = () => {
    form.reset();
    onCancel?.();
  };
  return (
    <Form {...form}>
      <form
        className="flex gap-4 group"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <UserAvatar
          size={"lg"}
          imageUrl={user?.imageUrl || "/placeholder.svg"}
          name={user?.fullName || "user"}
        />
        <div className="flex-1">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    <Textarea
                      placeholder={
                        variant === "reply"
                          ? "Reply to this comment"
                          : "Add a comment"
                      }
                      className="resize-none bg-transparent overflow-hidden min-h-0"
                      {...field}
                      disabled={createComment.isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 mt-2">
            {variant === "reply" && (
              <Button
                type="button"
                size={"sm"}
                disabled={createComment.isPending}
                variant={"ghost"}
                onClick={handlecancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size={"sm"}
              disabled={
                createComment.isPending || form.getValues("value") === ""
              }
            >
              Comment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
