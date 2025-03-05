import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/views/search-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ query: string; categoryId: string | undefined }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { query, categoryId } = await searchParams;
  void trpc.categories.getMany.prefetch();
  void trpc.search.getMany.prefetchInfinite({
    query,
    categoryId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
};

export default SearchPage;
