import MintPage from "@/components/MintPage";

async function fetchCollection(collectionAddress: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${baseUrl}/api/collections/${collectionAddress}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.collection;
}

export default async function CollectionMintPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params?.id) {
    return <div>Error: Missing Collection Address</div>;
  }

  const collection = await fetchCollection(params.id);

  if (!collection) {
    return <div>Error: Collection not found</div>;
  }

  return <MintPage collection={collection} />;
}
