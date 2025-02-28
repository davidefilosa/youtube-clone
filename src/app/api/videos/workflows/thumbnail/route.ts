import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const { videoId, userId, prompt } = context.requestPayload as InputType;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) {
      throw new Error("Video not found");
    }

    return existingVideo;
  });

  const { status, body } = await context.call<{ data: Array<{ url: string }> }>(
    "generate-description",
    {
      url: "https://api.openai.com/v1/images/generations",
      method: "POST",
      body: { prompt, n: 1, model: "dall-e-3", size: "1792x1024" },
      headers: {
        authorization: `Bearer ${process.env.OPENAI_SECRET_KEY}`,
      },
    }
  );

  console.log(body);

  const tempThumbnailUrl = body.data[0].url;

  if (!tempThumbnailUrl) {
    throw new Error("Failed to generate thumbanail");
  }

  const thumbnailUrl = await context.run("update-thumbnail", async () => {
    const utapi = new UTApi();

    const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

    if (!uploadedThumbnail.data) {
      throw new Error("Failed to generate thumbanail");
    }
    return uploadedThumbnail.data.ufsUrl;
  });

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ thumbnailUrl: thumbnailUrl })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
