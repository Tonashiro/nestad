import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const contractOwner = searchParams.get("contractOwner");

    const filter = contractOwner ? { contractOwner } : {};

    const collections = await Collection.find(filter, {
      collectionAddress: 1,
      name: 1,
      symbol: 1,
      description: 1,
      maxTokens: 1,
      collectionImage: 1,
      _id: 0,
    });

    return NextResponse.json({ collections }, { status: 200 });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
