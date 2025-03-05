"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videoUpdateSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import {
  CheckIcon,
  CopyCheckIcon,
  Globe2Icon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RefreshCcw,
  RotateCwIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakecaseToTitlecase } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/costants";
import { ThumbanilUploadModal } from "../ui/components/thumbnail-upload-modal";
import { ThumbanilGenerateModal } from "../ui/components/thumbnail-generate-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormVideoSkeletor />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormVideoSkeletor = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="space-y-8 lg:col-span-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-40" />
          <Skeleton className="h-12 w-full" />
        </div>

        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <Card className="p-4 bg-[#F9F9F9] rounded-xl">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 flex flex-col gap-y-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const router = useRouter();
  const [isCoping, setIsCoping] = useState(false);
  const [thumbnalilModalOpen, setThumbnalilModalOpen] = useState(false);
  const [thumbnalilGenerateModalOpen, setThumbnalilGenerateModalOpen] =
    useState(false);

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const utils = trpc.useUtils();
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("Video details saved", { id: "update-video" });
      utils.studio.getOne.invalidate({ id: video.id });
      utils.studio.getMany.invalidate();
    },
    onError: (e) => {
      toast.error("Failed to update video", { id: "update-video" });

      console.log(e);
    },
  });

  const restoreThumbanil = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      toast.success("Thumbnail restored", { id: "restore-thumbnail" });
      utils.studio.getOne.invalidate({ id: video.id });
      utils.studio.getMany.invalidate();
    },
    onError: (e) => {
      toast.error("Failed to restore thumbnail", { id: "restore-thumbnail" });

      console.log(e);
    },
  });

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Title generated", { id: "title-ai" });
      utils.studio.getOne.invalidate({ id: video.id });
      utils.studio.getMany.invalidate();
    },
    onError: (e) => {
      toast.error("Failed to generate title", { id: "title-ai" });

      console.log(e);
    },
  });

  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Description generated", { id: "description-ai" });
      utils.studio.getOne.invalidate({ id: video.id });
      utils.studio.getMany.invalidate();
    },
    onError: (e) => {
      toast.error("Failed to generate description", { id: "description-ai" });

      console.log(e);
    },
  });

  const onRestoreThumbnail = () => {
    toast.loading("Restoring thumbnail", { id: "restore-thumbnail" });
    restoreThumbanil.mutate({ id: video.id });
  };

  const onGenerateTitle = () => {
    toast.loading("Generating title", { id: "title-ai" });
    generateTitle.mutate({ id: video.id });
  };

  const onGenerateDescription = () => {
    toast.loading("Generating description", { id: "description-ai" });
    generateDescription.mutate({ id: video.id });
  };

  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      toast.success("Video deleted", { id: "update-video" });
      utils.studio.getOne.invalidate({ id: video.id });
      utils.studio.getMany.invalidate();
    },
    onError: (e) => {
      toast.error("Failed to delete video", { id: "update-video" });

      console.log(e);
    },
  });
  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const restore = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      toast.success("Video revalidated", { id: "revalidate-video" });
      utils.studio.getOne.invalidate({ id: video.id });
      utils.studio.getMany.invalidate();
    },
    onError: (e) => {
      toast.error("Failed to revalidate video", { id: "revalidate-video" });

      console.log(e);
    },
  });

  const onDelete = () => {
    toast.loading("Deleting video ", { id: "update-video" });
    remove.mutate({ id: video.id });
    router.push("/studio");
  };

  const onRestore = () => {
    toast.loading("Revalidating video ", { id: "revalidate-video" });
    restore.mutate({ id: video.id });
  };

  async function onSubmit(values: z.infer<typeof videoUpdateSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    toast.loading("Saving video details", { id: "update-video" });
    update.mutate(values);
  }

  const fullURL = `http://localhost:3000/videos/${video.id}`;

  const onCopy = () => {
    setIsCoping(true);
    navigator.clipboard.writeText(fullURL);
    const time = setTimeout(() => {
      setIsCoping(false);
    }, 2000);
    return () => {
      clearTimeout(time);
    };
  };

  return (
    <>
      <ThumbanilUploadModal
        open={thumbnalilModalOpen}
        onOpenChange={setThumbnalilModalOpen}
        videoId={video.id}
      />
      <ThumbanilGenerateModal
        open={thumbnalilGenerateModalOpen}
        videoId={video.id}
        onOpenChange={setThumbnalilGenerateModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="rounded-full"
                  >
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDelete}>
                    <TrashIcon className="site-4 ml-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRestore}>
                    <RefreshCcw className="site-4 ml-2" />
                    Restore
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-center">
                      <FormLabel>Title</FormLabel>
                      {video.muxTrackStatus === "ready" && (
                        <Button
                          type="button"
                          size={"icon"}
                          variant={"outline"}
                          onClick={onGenerateTitle}
                          className="rounded-full size-6 [&_svg]:size-3"
                          disabled={generateTitle.isPending}
                        >
                          {generateTitle.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Add a title to your video"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormLabel>Description</FormLabel>
                      {video.muxTrackStatus === "ready" && (
                        <Button
                          type="button"
                          size={"icon"}
                          variant={"outline"}
                          onClick={onGenerateDescription}
                          className="rounded-full size-6 [&_svg]:size-3"
                          disabled={generateDescription.isPending}
                        >
                          {generateDescription.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description to your video"
                        {...field}
                        value={field.value ?? ""}
                        rows={10}
                        className="resize-none pr-10"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image
                          src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
                          alt="Thumbnail"
                          className="object-cover"
                          fill
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 size-7"
                              size={"icon"}
                              type="button"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setThumbnalilModalOpen(true)}
                            >
                              <ImagePlusIcon className="size-4 mr-1" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setThumbnalilGenerateModalOpen(true)
                              }
                            >
                              <SparklesIcon className="size-4 mr-1" />
                              AI-Generated
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onRestoreThumbnail}>
                              <RotateCwIcon className="size-4 mr-1" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem value={category.id} key={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullURL}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant={"ghost"}
                          size={"icon"}
                          disabled={isCoping}
                          onClick={onCopy}
                        >
                          {isCoping ? <CopyCheckIcon /> : <CheckIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakecaseToTitlecase(video.muxStatus || "preparing")}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Subtitles status
                      </p>
                      <p className="text-sm">
                        {snakecaseToTitlecase(
                          video.muxTrackStatus || "no_subtitles"
                        )}
                      </p>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={"public"}>
                              <div className="flex items-center gap-x-2">
                                <Globe2Icon className="size-4" />
                                Public
                              </div>
                            </SelectItem>
                            <SelectItem
                              value={"private"}
                              className="flex items-center gap-x-2"
                            >
                              <div className="flex items-center gap-x-2">
                                <LockIcon className="size-4" />
                                Private
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
