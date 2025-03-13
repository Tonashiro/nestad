/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Interface for NFT data
 */
export interface NFT {
  name: string;
  contractName: string;
  contractAddress: string;
  tokenId: string;
  image: string;
  price?: number;
}

/**
 * Fetch NFTs from API
 * @param address - Wallet address
 * @param cursor - Cursor for pagination
 * @returns List of NFTs and next cursor
 */
export const fetchNFTs = async (
  address?: string,
  cursor: string = ""
): Promise<{ nfts: NFT[]; nextCursor: string | null }> => {
  if (!address) return { nfts: [], nextCursor: null };

  const res = await fetch("/api/getNFTs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, cursor }),
  });

  if (!res.ok) throw new Error("Failed to fetch NFTs");

  const data = await res.json();

  const formattedNFTs: NFT[] = data.nfts.map((nft: any) => ({
    name: nft.name || `Token #${nft.token_id}`,
    contractName: nft.collection?.name || "Unknown Collection",
    contractAddress: nft.contract_address,
    tokenId: nft.token_id,
    image:
      nft.image_url ||
      nft.previews?.image_medium_url ||
      "/nft_placeholder.webp",
    price: nft.price ? parseFloat(nft.price) : undefined,
  }));

  return { nfts: formattedNFTs, nextCursor: data.next_cursor || null };
};
