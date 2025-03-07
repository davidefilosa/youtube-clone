import React from "react";
import { LikedSection } from "../sections/liked-section";

export const LikedView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Liked video</h1>
        <p className="text-xs text-muted-foreground">Vidoe you have liked</p>
      </div>
      <LikedSection />
    </div>
  );
};
