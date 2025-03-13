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
import { Skeleton } from "@/components/ui/skeleton";
import { QuantitySelector } from "@/components/QuantitySelector";
import { fetchSaleConfig } from "@/services/fetchSaleConfig";
import { fetchCollectionConfig } from "@/services/fetchCollectionConfig";
import { mintNFT } from "@/services/mintNFT";
import { fetchTotalSupply } from "@/services/fetchTotalSupply";
import Image from "next/image";
import { useLoader } from "@/context/loaderContext";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SquareArrowOutUpRight } from "lucide-react";

interface MintPageProps {
  collection: ICollection;
}

export default function MintPage({ collection }: MintPageProps) {
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState(1);
  const { setLoading } = useLoader();

  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);

  const provider = walletClient
    ? new ethers.BrowserProvider(walletClient.transport)
    : null;

  /** Fetch sale configuration */
  const { data: saleConfig, isLoading: isSaleConfigLoading } = useQuery({
    queryKey: ["saleConfig", collection.collectionAddress],
    queryFn: () =>
      fetchSaleConfig(collection.collectionAddress, provider!, collection.type),
    enabled: !!provider,
  });

  /** Fetch total supply and max tokens with polling every 3s */
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useQuery({
    queryKey: ["supply", collection.collectionAddress],
    queryFn: () =>
      fetchTotalSupply(collection.collectionAddress, provider, collection.type),
    enabled: !!provider,
    refetchInterval: 3000,
  });

  const { data: collectionConfig, isLoading: isCollectionConfigLoading } =
    useQuery({
      queryKey: ["collectionConfig", collection.collectionAddress],
      queryFn: () =>
        fetchCollectionConfig(
          collection.collectionAddress,
          provider!,
          collection.type
        ),
      enabled: !!provider,
    });

  const mintMutation = useMutation({
    mutationFn: async (isWhitelist: boolean) => {
      if (!provider || !userAddress) {
        toast.error("Wallet not connected.");
        throw new Error("Wallet not connected.");
      }
      const { tokenId, txHash } = await mintNFT({
        userAddress,
        collection,
        provider,
        amount,
        isWhitelist,
        collectionType: collection.type,
      });

      setMintSuccess(true);
      setMintedTokenId(tokenId);
      setMintTxHash(txHash);
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("NFT Minted Successfully!");
    },
    onError: () => toast.error("Minting failed."),
  });

  const isFetching =
    isSaleConfigLoading || isCollectionConfigLoading || isTotalSupplyLoading;

  useEffect(() => {
    if (!isFetching) setLoading(false);
  }, [isFetching, setLoading]);

  return (
    <>
      <div className="grid md:grid-cols-2 items-center justify-self-center min-h-[calc(100svh-112px)] w-[80%]">
        <Image
          src={collection.collectionImage ?? "/nft_placeholder.webp"}
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

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="font-bold">Total Minted</span>
              {isTotalSupplyLoading ||
              isCollectionConfigLoading ||
              !collectionConfig?.maxTokens ? (
                <Skeleton className="w-20 h-6" />
              ) : (
                <span className="font-bold">
                  {totalSupply} / {collectionConfig?.maxTokens}
                </span>
              )}
            </div>
            {isTotalSupplyLoading || isCollectionConfigLoading ? (
              <Skeleton className="h-3 w-full rounded-md" />
            ) : (
              <Progress
                value={
                  (Number(totalSupply) /
                    Number(collectionConfig?.maxTokens ?? 1)) *
                  100
                }
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Price</h3>
            {isCollectionConfigLoading || !collectionConfig ? (
              <Skeleton className="w-32 h-8 rounded-md" />
            ) : (
              <span className="font-bold text-2xl text-monad-purple">
                {collection.hasWhitelist &&
                saleConfig?.whitelistEnd &&
                saleConfig.whitelistEnd > 0 &&
                Date.now() < saleConfig.whitelistEnd &&
                collectionConfig?.whitelistPrice
                  ? collectionConfig.whitelistPrice * amount
                  : collectionConfig?.mintPrice * amount}{" "}
                MON
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Amount to Mint</h3>
            {isCollectionConfigLoading || !collectionConfig?.maxMintPerTx ? (
              <Skeleton className="h-10 w-32 rounded-md" />
            ) : (
              <QuantitySelector
                max={collectionConfig?.maxMintPerTx ?? 1}
                amount={amount}
                setAmount={setAmount}
              />
            )}
          </div>

          {saleConfig ? (
            <>
              {collection.hasWhitelist &&
              saleConfig.whitelistEnd &&
              Date.now() < saleConfig.whitelistEnd ? (
                <>
                  {saleConfig.whitelistStart > 0 &&
                    Date.now() < saleConfig.whitelistStart && (
                      <p className="text-sm text-gray-300">
                        Whitelist Starts in:{" "}
                        {isSaleConfigLoading ? (
                          <Skeleton className="w-20 h-6" />
                        ) : (
                          <Countdown date={saleConfig.whitelistStart} />
                        )}
                      </p>
                    )}

                  {saleConfig.whitelistEnd > 0 &&
                    Date.now() >= saleConfig.whitelistStart && (
                      <p className="text-sm text-gray-300">
                        Whitelist Ends in:{" "}
                        {isSaleConfigLoading ? (
                          <Skeleton className="w-20 h-6" />
                        ) : (
                          <Countdown date={saleConfig.whitelistEnd} />
                        )}
                      </p>
                    )}

                  <Button
                    variant="secondary"
                    onClick={() => mintMutation.mutate(true)}
                    disabled={Date.now() > saleConfig.whitelistEnd}
                    className="mt-2 w-full"
                  >
                    Mint
                  </Button>
                </>
              ) : (
                <>
                  {saleConfig.publicSaleStart > 0 &&
                    Date.now() < saleConfig.publicSaleStart && (
                      <p className="text-sm text-gray-300">
                        Public Mint Starts in:{" "}
                        {isSaleConfigLoading ? (
                          <Skeleton className="w-20 h-6" />
                        ) : (
                          <Countdown date={saleConfig.publicSaleStart} />
                        )}
                      </p>
                    )}

                  <Button
                    variant="secondary"
                    onClick={() => mintMutation.mutate(false)}
                    disabled={Date.now() < saleConfig.publicSaleStart}
                    className="mt-2 w-full"
                  >
                    Mint
                  </Button>
                </>
              )}
            </>
          ) : (
            <Skeleton className="h-12 w-full rounded-md" />
          )}
        </div>
      </div>
      <Dialog open={mintSuccess} onOpenChange={setMintSuccess}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogTitle>Mint Successful!</DialogTitle>
          <DialogDescription>
            You have successfully minted an NFT from <b>{collection.name}</b>.
          </DialogDescription>

          {mintTxHash && (
            <Button variant="link" className="w-fit p-0">
              <Link
                href={`https://testnet.monadexplorer.com/tx/${mintTxHash}`}
                target="_blank"
                className="flex items-center gap-1"
              >
                Open in Monad Explorer
                <SquareArrowOutUpRight size={16} />
              </Link>
            </Button>
          )}

          {mintedTokenId && (
            <Link
              href={`https://magiceden.io/item-details/monad-testnet/${collection.collectionAddress}/${mintedTokenId}`}
              target="_blank"
            >
              <Button className="w-full bg-monad-purple hover:opacity-80">
                Trade on ME
              </Button>
            </Link>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
