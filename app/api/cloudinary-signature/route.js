import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: "Cloudinary is not configured on the server." }, { status: 500 });
  }

  const { folder = "house-electric" } = await request.json().catch(() => ({}));
  const timestamp = Math.round(Date.now() / 1000);

  // Only sign the params we actually send with the upload — no eager
  // transformations, so Cloudinary just stores the original file.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(paramsToSign).digest("hex");

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
