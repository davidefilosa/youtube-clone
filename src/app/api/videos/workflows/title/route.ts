import { db } from "@/db";
import { videos } from "@/db/schema";
import { TITLE_SYSTEM_PROMPT } from "@/modules/videos/costants";
import { serve } from "@upstash/workflow/nextjs";
import { eq, and } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

export const { POST } = serve(async (context) => {
  const { videoId, userId } = context.requestPayload as InputType;

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

  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    const text = await response.text();
    console.log(text);
    return text;
  });

  const { status, body } = await context.api.openai.call("generate-title", {
    token: process.env.OPENAI_SECRET_KEY!,
    operation: "chat.completions.create",
    body: {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: TITLE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    },
  });

  const title = body.choices[0].message.content;

  if (!title) {
    throw new Error("Failed to generate title");
  }

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ title: title })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
