import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Nestad1155", (m) => {
  // Collection Configuration
  const collectionConfig = {
    maxTokens: BigInt(10000),
    mintPrice: BigInt(5e16), // 0.05 ETH
    whitelistPrice: BigInt(3e16), // 0.03 ETH
    maxMintPerTx: BigInt(5),
    maxMintPerWallet: BigInt(20),
  };

  // Sale Configuration (Timestamps in seconds)
  const currentTime = Math.floor(Date.now() / 1000);

  const saleConfig = {
    hasWhitelist: true,
    whitelistStart: BigInt(currentTime + 3600), // Starts in 1 hour
    whitelistEnd: BigInt(currentTime + 7200), // Ends in 2 hours
    publicSaleStart: BigInt(currentTime + 10800), // Starts in 3 hours
    publicSaleEnd: BigInt(currentTime + 21600), // Ends in 6 hours
  };

  const royaltyFee = BigInt(500); // 5% royalty
  const baseUri = "https://example.com/metadata/";

  // Deploy the Nestad1155 contract
  const nestad1155 = m.contract("Nestad1155", [
    "Nestad1155 NFT",
    "NSTD1155",
    baseUri,
    collectionConfig,
    saleConfig,
    royaltyFee,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  ]);

  return { nestad1155 };
});
