import { ICollection } from "@/types";

type FetchCollectionsResponse = {
  collections: Array<
    { createdAt: string } & Pick<
      ICollection,
      | "collectionAddress"
      | "name"
      | "description"
      | "symbol"
      | "maxTokens"
      | "collectionImage"
    >
  >;
  nextCursor: string | null;
};

/**
 * Fetch collections with optional contractOwner filter and pagination.
 *
 * @param contractOwner - The wallet address of the collection owner (optional).
 * @param onlyMyCollections - Whether to filter collections by the owner.
 * @param cursor - The pagination cursor.
 * @returns An object containing collections and nextCursor.
 */
export const fetchCollections = async (
  contractOwner?: string,
  onlyMyCollections = false,
  cursor = ""
): Promise<FetchCollectionsResponse> => {
  const params = new URLSearchParams();

  if (contractOwner) params.append("contractOwner", contractOwner);

  if (onlyMyCollections) params.append("myCollections", "true");

  if (cursor) params.append("cursor", cursor);

  const res = await fetch(`/api/collections?${params.toString()}`);

  if (!res.ok) throw new Error("Failed to fetch collections");

  return res.json();
};
