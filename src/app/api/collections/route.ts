import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/backend/db/connection";
import Collection from "@/app/backend/db/collection.model";

export async function POST(req: Request) {
  try {
    await connectDB();

    const data = await req.json();

    if (!data.collectionAddress) {
      return NextResponse.json(
        { error: "Collection address is required" },
        { status: 400 }
      );
    }

    if (data.whitelistWallets && !Array.isArray(data.whitelistWallets)) {
      data.whitelistWallets = [];
    }

    const newCollection = new Collection(data);
    await newCollection.save();

    return NextResponse.json(
      { message: "Collection added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Fetch NFT collections with pagination and optional filtering.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const contractOwner = searchParams.get("contractOwner");
    const onlyMyCollections = searchParams.get("myCollections") === "true";
    const cursor = searchParams.get("cursor");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (contractOwner && onlyMyCollections) {
      filter.contractOwner = contractOwner;
    }

    const limit = 10;
    if (cursor) {
      filter.createdAt = { $lt: new Date(Number(cursor)) };
    }

    const collections = await Collection.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .select({
        collectionAddress: 1,
        name: 1,
        symbol: 1,
        description: 1,
        maxTokens: 1,
        collectionImage: 1,
        createdAt: 1,
        _id: 0,
      });

    let nextCursor: string | null = null;
    if (collections.length > limit) {
      nextCursor = new Date(collections.pop()?.createdAt || "")
        .getTime()
        .toString();
    }

    return NextResponse.json({ collections, nextCursor }, { status: 200 });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
