"use client";

import { useState, useMemo, SetStateAction, Dispatch } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchCollections } from "@/services/fetchCollections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bars } from "react-loader-spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";

/**
 * MyCollections Component - Displays all NFT collections with sorting and filtering.
 */
export default function MyCollections() {
  const { address } = useAccount();
  const router = useRouter();
  const [filterCreatedAt, setFilterCreatedAt] = useState<"newest" | "oldest">(
    "newest"
  );
  const [showMyCollections, setShowMyCollections] = useState(false);

  /** Fetch collections with infinite scrolling */
  const { data, isFetching, fetchNextPage } = useInfiniteQuery({
    queryKey: ["collections", address, showMyCollections],
    queryFn: async ({ pageParam = "" }) =>
      fetchCollections(address, showMyCollections, pageParam),
    enabled: true,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: "",
  });

  /** Flatten pages of collections */
  const collections = useMemo(
    () => data?.pages.flatMap((page) => page.collections) || [],
    [data]
  );

  /** Filter collections by createdAt */
  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      return filterCreatedAt === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [collections, filterCreatedAt]);

  /** Attach infinite scroll */
  const loadMoreRef = useInfiniteScroll(fetchNextPage, isFetching);

  return (
    <div className="min-h-[calc(100svh-112px)] flex flex-col items-center p-6">
      {sortedCollections.length > 0 && !isFetching ? (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              onValueChange={(value) =>
                setFilterCreatedAt(value as "newest" | "oldest")
              }
              defaultValue="newest"
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by Created Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="my-collections"
                checked={showMyCollections}
                onCheckedChange={
                  setShowMyCollections as Dispatch<SetStateAction<CheckedState>>
                }
              />
              <label htmlFor="my-collections" className="text-sm font-medium">
                Show My Collections Only
              </label>
            </div>
          </div>

          <section className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6 w-full">
            {sortedCollections.map((collection) => {
              return (
                <Card
                  key={collection.collectionAddress}
                  className="shadow-lg cursor-pointer hover:opacity-90 transition-opacity border-none"
                  onClick={() =>
                    router.push(`/collections/${collection.collectionAddress}`)
                  }
                >
                  <CardHeader className="relative p-0 pb-4">
                    <Image
                      src={
                        collection.collectionImage ?? "/nft_placeholder.webp"
                      }
                      width={120}
                      height={120}
                      alt={collection.name}
                      className="w-full h-[250px] rounded-t-lg aspect-square"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle>
                      {collection.name} ({collection.symbol})
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-3 overflow-hidden text-ellipsis whitespace-nowrap">
                      {collection.description || "No description"}
                    </p>

                    <Button
                      className="w-full bg-monad-purple hover:bg-monad-purple hover:opacity-80"
                      onClick={() =>
                        router.push(
                          `/collections/${collection.collectionAddress}`
                        )
                      }
                    >
                      Mint Page
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        </>
      ) : (
        !isFetching && (
          <h1 className="m-auto font-bold text-3xl text-gray-500 whitespace-nowrap">
            No collections found
          </h1>
        )
      )}

      {/* Invisible element to trigger infinite scroll */}
      <div ref={loadMoreRef} className="h-10 w-full" />

      {isFetching && (
        <div className="flex justify-center items-center min-h-[calc(100svh-112px)] w-full">
          <Bars
            height="60"
            width="60"
            color="hsl(var(--monad-purple))"
            ariaLabel="bars-loading"
            visible={true}
          />
        </div>
      )}
    </div>
  );
}
