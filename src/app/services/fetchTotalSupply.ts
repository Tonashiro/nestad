import { contractABI } from "@/constants";
import { ethers } from "ethers";

export const fetchTotalSupply = async (
  collectionAddress: string,
  provider: ethers.BrowserProvider | null
) => {
  try {
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
