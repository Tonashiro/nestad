/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const SIMPLEHASH_API_KEY = process.env.NEXT_PUBLIC_SH_API_KEY ?? "";
const SIMPLEHASH_API_URL = `${process.env.NEXT_PUBLIC_SH_API_BASE_URL}nfts/owners_v2`;

export async function POST(req: Request) {
  try {
    const { address, cursor = "" } = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Construct request URL with optional cursor for pagination
    const requestUrl = `${SIMPLEHASH_API_URL}?chains=monad-testnet&wallet_addresses=${address}&order_by=transfer_time__desc&limit=20${
      cursor ? `&cursor=${cursor}` : ""
    }`;

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": SIMPLEHASH_API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch NFTs" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      nfts: data.nfts,
      next_cursor: data.next_cursor, // Used for pagination
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
