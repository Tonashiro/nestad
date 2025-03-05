export interface ICollection {
  collectionAddress: string;
  name: string;
  symbol: string;
  baseUri?: string;
  description?: string;
  maxTokens: number;
  price: number;
  whitelistPrice?: number;
  maxMintPerTx: number;
  maxMintPerWallet: number;
  publicSaleStart?: Date;
  publicSaleEnd?: Date;
  hasWhitelist: boolean;
  whitelistStart?: Date;
  whitelistEnd?: Date;
  whitelistWallets?: string[];
  royaltyFee: number;
}
