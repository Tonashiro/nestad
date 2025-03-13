import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/backend/db/connection";
import Collection from "@/app/backend/db/collection.model";

export async function GET(
  req: NextRequest,
  { params }: { params?: { id?: string } }
) {
  try {
    await connectDB();

    if (!params?.id) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    const collectionAddress = params.id;

    const collection = await Collection.findOne({ collectionAddress });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
