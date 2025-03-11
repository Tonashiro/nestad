import { keccak256, getAddress, solidityPacked } from "ethers";
import MerkleTree from "merkletreejs";

/**
 * Generates a Merkle proof for the given address
 * @param addresses - List of whitelisted addresses
 * @param userAddress - Address to generate proof for
 * @returns Merkle proof array
 */
export function generateMerkleProof(addresses: string[], userAddress: string) {
  const normalizedAddresses = addresses.map((addr) => getAddress(addr.trim()));

  const leaves = normalizedAddresses.map((addr) =>
    keccak256(solidityPacked(["address"], [addr]))
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const normalizedUserAddress = getAddress(userAddress.trim());
  const leaf = keccak256(solidityPacked(["address"], [normalizedUserAddress]));

  const proof = tree.getHexProof(leaf);

  return proof;
}
