import { DEFAULT_LIMIT } from "@/constants";
import { HomeView } from "@/modules/home/ui/view/home-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.videos.getMany.prefetchInfinite({
    categoryId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
}
