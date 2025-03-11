import { ICollection } from "@/types";

type FetchCollectionsResponse = Pick<
  ICollection,
  | "collectionAddress"
  | "name"
  | "description"
  | "symbol"
  | "maxTokens"
  | "collectionImage"
>;

export const fetchCollections = async (
  contractOwner?: string
): Promise<FetchCollectionsResponse[] | []> => {
  if (!contractOwner) return [];

  const res = await fetch(`/api/collections?contractOwner=${contractOwner}`);

  if (!res.ok) throw new Error("Failed to fetch collections");

  const data = await res.json();

  return data.collections || [];
};
