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
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Please provide playlist name"),
});
export const CreatePlaylistModal = ({
  open,
  onOpenChange,
}: CreatePlaylistModalProps) => {
  const utils = trpc.useUtils();
  const createPlaylist = trpc.playlist.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created", { id: "playlist" });
      utils.playlist.getMany.invalidate();
    },
    onError: (error) => {
      toast.error("Faild to create playlist", { id: "playlist" });
      console.log(error);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    toast.loading("Creating playlist", { id: "playlist" });
    createPlaylist.mutate({ name: values.name });
    onOpenChange(false);
    form.reset();
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create a playlist"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Web Development" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a name for your collection.
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
