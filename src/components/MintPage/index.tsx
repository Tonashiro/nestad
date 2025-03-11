"use client";

import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ethers } from "ethers";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Countdown from "react-countdown";
import { ICollection } from "@/types";
import { QuantitySelector } from "@/components/QuantitySelector";
import { fetchSaleConfig } from "@/app/services/fetchSaleConfig";
import { fetchCollectionConfig } from "@/app/services/fetchCollectionConfig";
import { mintNFT } from "@/app/services/mintNFT";
import { fetchTotalSupply } from "@/app/services/fetchTotalSupply";
import Image from "next/image";
import { useLoader } from "@/context/loaderContext";

interface MintPageProps {
  collection: ICollection;
}

export default function MintPage({ collection }: MintPageProps) {
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState(1);
  const { setLoading } = useLoader();

  const provider = walletClient
    ? new ethers.BrowserProvider(walletClient.transport)
    : null;

  /** Fetch sale configuration */
  const { data: saleConfig, isLoading: isSaleConfigLoading } = useQuery({
    queryKey: ["saleConfig", collection.collectionAddress],
    queryFn: () => fetchSaleConfig(collection.collectionAddress, provider!),
    enabled: !!provider,
  });

  /** Fetch total supply and max tokens with polling every 3s */
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useQuery({
    queryKey: ["supply", collection.collectionAddress],
    queryFn: () => fetchTotalSupply(collection.collectionAddress, provider),
    enabled: !!provider,
    refetchInterval: 3000,
  });

  /** Fetch max mint per transaction */
  const { data: collectionConfig, isLoading: isCollectionConfigLoading } =
    useQuery({
      queryKey: ["collectionConfig", collection.collectionAddress],
      queryFn: () =>
        fetchCollectionConfig(collection.collectionAddress, provider!),
      enabled: !!provider,
    });

  /** Mint mutation */
  const mintMutation = useMutation({
    mutationFn: async (isWhitelist: boolean) => {
      if (!provider || !userAddress) {
        toast.error("Wallet not connected.");
        throw new Error("Wallet not connected.");
      }
      return mintNFT({
        userAddress,
        collection,
        provider,
        amount,
        isWhitelist,
      });
    },
    onSuccess: () => toast.success("NFT Minted Successfully!"),
    onError: () => toast.error("Minting failed."),
  });

  const isFetching =
    isSaleConfigLoading || isCollectionConfigLoading || isTotalSupplyLoading;

  useEffect(() => {
    if (!isFetching) setLoading(false);
  }, [isFetching, setLoading]);

  return (
    <div className="grid md:grid-cols-2 items-center justify-self-center min-h-[calc(100svh-112px)] w-[80%]">
      <Image
        src={(collection.collectionImage as string) ?? "/nft_placeholder.webp"}
        alt={collection.name}
        width={200}
        height={200}
        className="w-full h-auto rounded-lg max-w-[70%] bg-white"
      />

      <div className="flex flex-col space-y-4 bg-[rgba(131,91,209,0.2)] backdrop-blur-2xl p-4 rounded-lg h-fit">
        <h2 className="text-3xl font-bold">{collection.name}</h2>
        <Link
          href={`https://testnet.monadexplorer.com/address/${collection.collectionAddress}`}
          target="_blank"
          className="text-blue-400"
        >
          {collection.collectionAddress}
        </Link>

        {collectionConfig?.maxTokens && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="font-bold">Total Minted</span>
              <span className="font-bold">
                {totalSupply} / {collectionConfig.maxTokens}
              </span>
            </div>
            <Progress
              value={
                (Number(totalSupply) / Number(collectionConfig.maxTokens)) * 100
              }
            />
          </div>
        )}

        {collectionConfig && collectionConfig.mintPrice >= 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Price</h3>
            <span className="font-bold text-2xl text-monad-purple">
              {collection.hasWhitelist &&
              saleConfig?.whitelistEnd &&
              saleConfig.whitelistEnd > 0 &&
              Date.now() < saleConfig.whitelistEnd &&
              collectionConfig.whitelistPrice
                ? collectionConfig.whitelistPrice * amount
                : collectionConfig.mintPrice * amount}{" "}
              MON
            </span>
          </div>
        )}

        {collectionConfig?.maxMintPerTx && (
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Amount to Mint</h3>
            <QuantitySelector
              max={collectionConfig.maxMintPerTx}
              amount={amount}
              setAmount={setAmount}
            />
          </div>
        )}

        {saleConfig && (
          <>
            {collection.hasWhitelist &&
            saleConfig.whitelistEnd &&
            new Date().getTime() < saleConfig.whitelistEnd ? (
              <>
                {saleConfig.whitelistStart > 0 &&
                  new Date().getTime() < saleConfig.whitelistStart && (
                    <p className="text-sm text-gray-300">
                      Whitelist Starts in:{" "}
                      <Countdown date={saleConfig.whitelistStart} />
                    </p>
                  )}

                {saleConfig.whitelistEnd > 0 &&
                  new Date().getTime() >= saleConfig.whitelistStart && (
                    <p className="text-sm text-gray-300">
                      Whitelist Ends in:{" "}
                      <Countdown date={saleConfig.whitelistEnd} />
                    </p>
                  )}

                <Button
                  variant="secondary"
                  onClick={() => mintMutation.mutate(true)}
                  disabled={new Date().getTime() > saleConfig.whitelistEnd}
                  className="mt-2 w-full"
                >
                  Mint
                </Button>
              </>
            ) : (
              <>
                {saleConfig.publicSaleStart > 0 &&
                  new Date().getTime() < saleConfig.publicSaleStart && (
                    <p className="text-sm text-gray-300">
                      Public Mint Starts in:{" "}
                      <Countdown date={saleConfig.publicSaleStart} />
                    </p>
                  )}

                {saleConfig.publicSaleEnd > 0 &&
                  new Date().getTime() >= saleConfig.publicSaleStart &&
                  new Date().getTime() < saleConfig.publicSaleEnd && (
                    <p className="text-sm text-gray-300">
                      Public Mint Ends in:{" "}
                      <Countdown date={saleConfig.publicSaleEnd} />
                    </p>
                  )}

                <Button
                  variant="secondary"
                  onClick={() => mintMutation.mutate(false)}
                  disabled={new Date().getTime() < saleConfig.publicSaleStart}
                  className="mt-2 w-full"
                >
                  Mint
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
