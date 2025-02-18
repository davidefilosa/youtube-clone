import { PlayIcon } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-1 cursor-pointer">
      <div className="rounded-lg bg-red-500 flex items-center justify-center  py-1 px-2">
        <PlayIcon className="stroke-white size-4" />
      </div>
      <span className="font-semibold text-xl tracking-tight">NewTube</span>
    </div>
  );
};
