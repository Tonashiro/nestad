"use client";
/* eslint-disable @next/next/no-img-element */

import { fetchCollections } from "@/app/services/fetchCollections";
import { fetchTotalSupply } from "@/app/services/fetchTotalSupply";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLoader } from "@/context/loaderContext";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";

export default function MyCollections() {
  const { address } = useAccount();
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const { setLoading } = useLoader();

  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ["collections", address],
    queryFn: () => fetchCollections(address),
    enabled: !!address,
  });

  const { data: supplies = {}, isLoading: isLoadingSupply } = useQuery({
    queryKey: ["supplies", collections],
    queryFn: async () => {
      if (!collections || collections.length === 0) return {};
      const supplyPromises = collections.map(async (collection) => {
        const provider = walletClient
          ? new ethers.BrowserProvider(walletClient.transport)
          : null;

        const supply = await fetchTotalSupply(
          collection.collectionAddress,
          provider
        );
        return { [collection.collectionAddress]: supply };
      });

      const supplyResults = await Promise.all(supplyPromises);
      return Object.assign({}, ...supplyResults);
    },
    enabled: !!collections?.length,
  });

  const isFetching = isLoadingCollections || isLoadingSupply;

  useEffect(() => {
    if (!isFetching) setLoading(false);
  }, [isFetching, setLoading]);

  return (
    <>
      {collections && collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {collections.map((collection) => {
            const totalSupply = supplies[collection.collectionAddress] || 0;
            const progress = (totalSupply / collection.maxTokens) * 100;

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
                    src={collection.collectionImage ?? "/nft_placeholder.webp"}
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

                  <div className="relative pt-2">
                    <span className="absolute left-0 right-0 bottom-2 text-center text-xs font-semibold">
                      {totalSupply} / {collection.maxTokens}
                    </span>
                    <Progress value={progress} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isFetching && collections && collections.length <= 0 && (
        <div className="flex items-center justify-center w-full h-[calc(100svh-112px)]">
          <h1 className="text-center text-gray-400 text-4xl">
            No collections found.
          </h1>
        </div>
      )}
    </>
  );
}
