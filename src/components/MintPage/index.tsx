"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "react-toastify";
import { contractABI } from "@/constants";
import { Button } from "@/components/ui/button";
import Countdown from "react-countdown";
import { ICollection } from "@/types";

interface MintPageProps {
  collection: ICollection;
}

export default function MintPage({ collection }: MintPageProps) {
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [minting, setMinting] = useState(false);
  const [amount, setAmount] = useState(1);

  const getPriceInWei = (price: number) => ethers.parseEther(price.toString());

  const mint = async (isWhitelist: boolean) => {
    if (!walletClient) {
      toast.error("No wallet client found. Please reconnect.");
      return;
    }

    setMinting(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        collection.collectionAddress,
        contractABI,
        signer
      );

      let tx;

      if (isWhitelist) {
        const proofRes = await fetch(`/api/generateProof`, {
          method: "POST",
          body: JSON.stringify({
            userAddress,
            collectionAddress: collection.collectionAddress,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const { proof } = await proofRes.json();

        if (!proof) throw new Error("Could not generate Merkle proof");

        tx = await contract.whitelistMint(proof, amount, {
          value: getPriceInWei(collection.whitelistPrice ?? 0) * BigInt(amount),
        });
      } else {
        tx = await contract.publicMint(amount, {
          value: getPriceInWei(collection.price) * BigInt(amount),
        });
      }

      await tx.wait();
      toast.success("NFT Minted Successfully!");
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Minting failed.");
    }
    setMinting(false);
  };

  const publicStartTime =
    collection?.publicSaleStart || collection?.whitelistEnd;
  const isWhitelistActive =
    collection?.whitelistStart &&
    new Date() < new Date(collection.whitelistEnd!);
  const isPublicActive =
    publicStartTime && new Date() >= new Date(publicStartTime);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{collection.name}</h2>
      <p className="mb-4">{collection.description}</p>
      {/* {collection.collectionImage && (
        <img
          src={collection.collectionImage}
          alt={collection.name}
          className="mb-4 rounded-lg"
        />
      )} */}
      <p className="font-bold">Total Supply: {collection.maxTokens}</p>

      {/* Whitelist Mint Section */}
      {collection.whitelistStart && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="font-bold">Whitelist Mint</h3>
          {isWhitelistActive ? (
            <Countdown date={new Date(collection.whitelistEnd!)} />
          ) : (
            <p className="text-gray-500">Whitelist mint ended.</p>
          )}
          <Button
            onClick={() => mint(true)}
            disabled={!isWhitelistActive || minting}
            className="mt-2 w-full"
          >
            {minting ? "Minting..." : "Mint with Whitelist"}
          </Button>
        </div>
      )}

      {/* Public Mint Section */}
      {publicStartTime && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="font-bold">Public Mint</h3>
          {isPublicActive ? (
            <p className="text-green-600">Public mint is live!</p>
          ) : (
            <Countdown date={new Date(publicStartTime!)} />
          )}
          <Button
            onClick={() => mint(false)}
            disabled={!isPublicActive || minting}
            className="mt-2 w-full"
          >
            {minting ? "Minting..." : "Mint Publicly"}
          </Button>
        </div>
      )}

      {/* Input for Mint Amount */}
      <div className="mt-4">
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}
