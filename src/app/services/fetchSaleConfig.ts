import { ethers } from "ethers";
import { contractABI } from "@/constants";

/** Fetch sale config from contract */
export async function fetchSaleConfig(
  contractAddress: string,
  provider: ethers.BrowserProvider
) {
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
