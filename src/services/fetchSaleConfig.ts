import { ethers } from "ethers";
import {
  sameCollectionContractABI,
  uniqueCollectionContractABI,
} from "@/constants";
import { COLLECTION_TYPE } from "@/types";

/** Fetch sale config from contract */
export async function fetchSaleConfig(
  contractAddress: string,
  provider: ethers.BrowserProvider,
  collectionType: COLLECTION_TYPE
) {
  const contractABI =
    collectionType === COLLECTION_TYPE.SAME_ART
      ? sameCollectionContractABI
      : uniqueCollectionContractABI;

  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const saleConfig = await contract.saleConfig();

  return {
    whitelistStart: Number(saleConfig.whitelistStart) * 1000,
    whitelistEnd: Number(saleConfig.whitelistEnd) * 1000,
    publicSaleStart:
      Number(saleConfig.publicSaleStart) * 1000 ||
      Number(saleConfig.whitelistEnd) * 1000,
    publicSaleEnd: Number(saleConfig.publicSaleEnd) * 1000,
  };
}
