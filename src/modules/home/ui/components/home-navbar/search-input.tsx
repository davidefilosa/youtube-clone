"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = new URL("/search", "http://localhost:3000");
    const newQuery = value.trim();
    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setValue(newQuery);

    router.push(url.toString());
  };
  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500 group"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        {value && (
          <Button
            disabled={!value.trim()}
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          >
            <XIcon className="text-gray-500" />
          </Button>
        )}
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
