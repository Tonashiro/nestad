import { clsx, type ClassValue } from "clsx";
import { getAddress, keccak256, solidityPacked } from "ethers";
import { twMerge } from "tailwind-merge";
import { MerkleTree } from "merkletreejs";

/**
 * Merges multiple class names using `clsx` and `tailwind-merge`.
 *
 * This function is useful for conditionally combining multiple class names
 * while ensuring Tailwind utility classes are properly merged.
 *
 * @param inputs - An array of class names or objects with conditional class names.
 * @returns A string containing the merged class names.
 *
 * @example
 * ```ts
 * const buttonClass = cn("px-4 py-2", isPrimary && "bg-blue-500", "text-white");
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates a Merkle root from a list of Ethereum addresses.
 *
 * This function normalizes addresses, hashes them using `keccak256(abi.encodePacked(address))`,
 * constructs a Merkle tree, and returns the Merkle root.
 *
 * @param addresses - An array of Ethereum addresses.
 * @returns The Merkle root as a hexadecimal string.
 */
export const generateMerkleRoot = (addresses: string[]): string => {
  const normalizedAddresses = addresses.map((addr) => getAddress(addr.trim()));

  const leaves = normalizedAddresses.map((addr) =>
    keccak256(solidityPacked(["address"], [addr]))
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  return tree.getHexRoot();
};
