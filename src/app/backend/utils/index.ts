import { keccak256 } from "ethers";
import MerkleTree from "merkletreejs";

/**
 * Generates a Merkle proof for the given address
 * @param addresses - List of whitelisted addresses
 * @param userAddress - Address to generate proof for
 * @returns Merkle proof array
 */
export function generateMerkleProof(addresses: string[], userAddress: string) {
  const leaves = addresses.map((addr) => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const leaf = keccak256(userAddress);
  return tree.getHexProof(leaf);
}
