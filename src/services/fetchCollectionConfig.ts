import {
  sameCollectionContractABI,
  uniqueCollectionContractABI,
} from "@/constants";
import { COLLECTION_TYPE } from "@/types";
import { ethers } from "ethers";

interface ICollectionConfig {
  maxTokens: number;
  mintPrice: number;
  whitelistPrice: number;
  maxMintPerTx: number;
  maxMintPerWallet: number;
}

/** Fetch max mint per transaction */
export async function fetchCollectionConfig(
  contractAddress: string,
  provider: ethers.BrowserProvider,
  collectionType: COLLECTION_TYPE
): Promise<ICollectionConfig> {
  const contractABI =
    collectionType === COLLECTION_TYPE.SAME_ART
      ? sameCollectionContractABI
      : uniqueCollectionContractABI;
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const result = await contract.collectionConfig();

  return {
    maxTokens: Number(result[0]),
    mintPrice: Number(ethers.formatEther(result[1])),
    whitelistPrice: Number(ethers.formatEther(result[2])),
    maxMintPerTx: Number(result[3]),
    maxMintPerWallet: Number(result[4]),
  };
}
