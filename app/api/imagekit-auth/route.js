import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !publicKey || !urlEndpoint) {
    return NextResponse.json({ error: "ImageKit is not configured on the server." }, { status: 500 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const accessToken = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  // Any signed-in user (admin or customer) may request an upload token — this
  // powers both the admin content uploads and the customer service-request
  // photo upload. The important boundary is "signed in", not "admin": it
  // keeps the endpoint out of reach of anonymous abuse while still letting
  // customers attach a photo to their own service requests.
  const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(accessToken);
  if (userErr || !user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");

  return NextResponse.json({ token, expire, signature, publicKey, urlEndpoint });
}
