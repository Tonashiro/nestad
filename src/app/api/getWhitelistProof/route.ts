import { NextResponse } from "next/server";
import connectDB from "@/app/backend/db/connection";
import Collection from "@/app/backend/db/collection.model";
import { generateMerkleProof } from "@/app/backend/utils";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userAddress, collectionAddress } = await req.json();

    if (!userAddress || !collectionAddress) {
      return NextResponse.json(
        { error: "Missing user address or collection address" },
        { status: 400 }
      );
    }

    const collection = await Collection.findOne({ collectionAddress });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const whitelistedWallets = Array.isArray(collection.whitelistWallets)
      ? collection.whitelistWallets
      : [];

    const proof = generateMerkleProof(whitelistedWallets, userAddress);

    return NextResponse.json({ proof }, { status: 200 });
  } catch (error) {
    console.error("Error generating Merkle Proof:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
