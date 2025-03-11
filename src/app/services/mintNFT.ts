import { contractABI } from "@/constants";
import { ICollection } from "@/types";
import { ethers } from "ethers";

interface MintNFTParams {
  userAddress: string;
  collection: ICollection;
  provider: ethers.BrowserProvider;
  amount: number;
  isWhitelist: boolean;
}

export async function mintNFT({
  userAddress,
  collection,
  provider,
  amount,
  isWhitelist,
}: MintNFTParams) {
  try {
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

      return await contract.whitelistMint(proof, amount, { value: price });
    }

    return await contract.publicMint(amount, { value: price });
  } catch (error) {
    console.error("Minting failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Minting transaction failed"
    );
  }
}
