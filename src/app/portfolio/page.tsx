"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { fetchNFTs } from "@/services/fetchNFTs";
import { Bars } from "react-loader-spinner";

/**
 * Portfolio Component - Displays user's Monad NFTs with sorting and filtering
 */
export default function Portfolio() {
  const { address } = useAccount();
  const [selectedCollection, setSelectedCollection] = useState<string | "all">(
    "all"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /** Fetch NFTs with Infinite Scrolling */
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["nfts", address],
    queryFn: async ({ pageParam = "" }) => fetchNFTs(address, pageParam),
    enabled: !!address,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: "",
  });

  const nfts = useMemo(
    () => data?.pages.flatMap((page) => page.nfts) || [],
    [data]
  );

  const uniqueCollections = useMemo(
    () => Array.from(new Set(nfts.map((nft) => nft.contractName))),
    [nfts]
  );

  const filteredAndSortedNFTs = useMemo(() => {
    let filteredNFTs = nfts;

    if (selectedCollection !== "all") {
      filteredNFTs = filteredNFTs.filter(
        (nft) => nft.contractName === selectedCollection
      );
    }

    return filteredNFTs.sort((a, b) =>
      sortOrder === "asc"
        ? (a.price || 0) - (b.price || 0)
        : (b.price || 0) - (a.price || 0)
    );
  }, [nfts, selectedCollection, sortOrder]);

  /** Automatically fetch the next page when scrolling near the bottom */
  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching]);

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Monad NFT Portfolio</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Collection Filter */}
        <Select
          onValueChange={(value) => setSelectedCollection(value)}
          defaultValue="all"
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {uniqueCollections.map((collection, index) => (
              <SelectItem key={index} value={collection}>
                {collection}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sorting */}
        <Select
          onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          defaultValue="desc"
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Price: High to Low</SelectItem>
            <SelectItem value="asc">Price: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* NFTs Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-5xl">
        {filteredAndSortedNFTs.length > 0 ? (
          filteredAndSortedNFTs.map((nft, index) => (
            <Card
              key={`${nft.contractAddress}-${nft.tokenId}-${index}`}
              className="shadow-md"
            >
              <CardContent className="p-4">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  height={200}
                  width={200}
                  className="w-full h-48 object-cover rounded-md"
                  onError={(e) =>
                    (e.currentTarget.src = "/nft_placeholder.webp")
                  }
                />
                <h2 className="text-lg font-semibold mt-2 text-monad-purple">
                  {nft.name}
                </h2>
                <p className="text-sm text-gray-600">{nft.contractName}</p>
                <p className="text-xs text-gray-500 text-ellipsis overflow-hidden">
                  {nft.contractAddress}
                </p>

                <Link
                  href={`https://magiceden.io/item-details/monad-testnet/${nft.contractAddress}/${nft.tokenId}`}
                  target="_blank"
                >
                  <Button className="mt-3 w-full bg-monad-purple hover:opacity-80 hover:bg-monad-purple">
                    Trade on ME
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No NFTs found.</p>
        )}
      </section>

      {/* Invisible element to trigger infinite scroll */}
      <div ref={loadMoreRef} className="h-10 w-full" />

      {isFetching && (
        <div className="flex justify-center items-center w-full">
          <Bars
            height="60"
            width="60"
            color="hsl(var(--monad-purple))"
            ariaLabel="bars-loading"
            visible={true}
          />
        </div>
      )}
    </main>
  );
}
