import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/pinata";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { cid } = await pinata.upload.public.file(file);
    const url = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`;

    return NextResponse.json(url, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
