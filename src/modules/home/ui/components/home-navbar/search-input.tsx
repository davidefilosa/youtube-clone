import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import React from "react";

export const SearchInput = () => {
  return (
    <form className="flex w-full max-w-[600px]">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500 group"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center border border-l-0 rounded-r-full hover:bg-secondary transition-all px-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SearchIcon className="text-muted-foreground size-6 " />
      </button>
    </form>
  );
};
