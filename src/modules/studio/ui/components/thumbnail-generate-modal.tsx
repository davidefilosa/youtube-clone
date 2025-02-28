"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ThumbanilGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
});
export const ThumbanilGenerateModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbanilGenerateModalProps) => {
  const utils = trpc.useUtils();
  const generateThumbnail = trpc.videos.generateThumbnail.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await generateThumbnail.mutateAsync({ id: videoId, prompt: values.prompt });
    onOpenChange(false);
    utils.studio.getOne.invalidate({ id: videoId });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Generate a thumbnail"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="E.g., A futuristic city skyline at sunset with neon signs, a cyberpunk-style character in a leather jacket, and glowing blue lights."
                    {...field}
                    rows={5}
                    cols={30}
                    className="resize-none"
                  />
                </FormControl>
                <FormDescription>
                  Enter a detailed description of your video to generate the
                  perfect thumbnail. Be specific about the subject, colors,
                  mood, and any key elements you want to include.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
