export interface ICollection {
  collectionAddress: string;
  contractOwner: string;
  type: COLLECTION_TYPE;
  name: string;
  symbol: string;
  baseUri?: string;
  description?: string;
  collectionImage?: string;
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

export enum COLLECTION_TYPE {
  SAME_ART = "SAME_ART",
  UNIQUE_ART = "UNIQUE_ART",
}
