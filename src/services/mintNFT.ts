/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  sameCollectionContractABI,
  uniqueCollectionContractABI,
} from "@/constants";
import { COLLECTION_TYPE, ICollection } from "@/types";
import { ethers } from "ethers";

interface MintNFTParams {
  userAddress: string;
  collection: ICollection;
  provider: ethers.BrowserProvider;
  amount: number;
  isWhitelist: boolean;
  collectionType: COLLECTION_TYPE;
}

export async function mintNFT({
  userAddress,
  collection,
  provider,
  amount,
  isWhitelist,
  collectionType,
}: MintNFTParams) {
  try {
    const contractABI =
      collectionType === COLLECTION_TYPE.SAME_ART
        ? sameCollectionContractABI
        : uniqueCollectionContractABI;
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      collection.collectionAddress,
      contractABI,
      signer
    );

    const whitelistPrice = collection.whitelistPrice ?? 0;
    const publicPrice = collection.price ?? 0;

    const price =
      ethers.parseEther(
        (isWhitelist ? whitelistPrice : publicPrice).toString()
      ) * BigInt(amount);

    let tx;

    if (isWhitelist) {
      const response = await fetch(`/api/getWhitelistProof`, {
        method: "POST",
        body: JSON.stringify({
          userAddress,
          collectionAddress: collection.collectionAddress,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Merkle proof: ${response.statusText}`);
      }

      const { proof } = await response.json();

      if (!proof) throw new Error("Could not generate Merkle proof");

      tx = await contract.whitelistMint(proof, amount, { value: price });
    } else {
      tx = await contract.publicMint(amount, { value: price });
    }

    const receipt = await tx.wait();

    let tokenId = "0";

    if (collectionType === COLLECTION_TYPE.UNIQUE_ART) {
      const transferEvent = receipt.logs.find(
        (log: any) => log.fragment.name === "Transfer"
      );

      if (!transferEvent) {
        throw new Error("Minting event not found in transaction logs.");
      }

      tokenId = transferEvent.args[2]?.toString();
    }

    return { tokenId, txHash: tx.hash };
  } catch (error) {
    console.error("Minting failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Minting transaction failed"
    );
  }
}
