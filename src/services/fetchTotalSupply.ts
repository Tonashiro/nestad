import {
  sameCollectionContractABI,
  uniqueCollectionContractABI,
} from "@/constants";
import { COLLECTION_TYPE } from "@/types";
import { ethers } from "ethers";

export const fetchTotalSupply = async (
  collectionAddress: string,
  provider: ethers.BrowserProvider | null,
  collectionType: COLLECTION_TYPE
) => {
  try {
    const contractABI =
      collectionType === COLLECTION_TYPE.SAME_ART
        ? sameCollectionContractABI
        : uniqueCollectionContractABI;
    const contract = new ethers.Contract(
      collectionAddress,
      contractABI,
      provider
    );
    const totalSupply = await contract.totalSupply();

    return Number(totalSupply);
  } catch (error) {
    console.error(`Error fetching supply for ${collectionAddress}:`, error);
    return 0;
  }
};
