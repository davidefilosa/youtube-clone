import React from "react";
import { HistorySection } from "../sections/history-section";

export const HistoryView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Watch history</h1>
        <p className="text-xs text-muted-foreground">Vidoe you have watched</p>
      </div>
      <HistorySection />
    </div>
  );
};
