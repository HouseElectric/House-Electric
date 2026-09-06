import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function sign(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(sorted + API_SECRET).digest("hex");
}

async function uploadBuffer(buffer, filename, folder) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary env vars missing.");
  }
  const timestamp = Math.round(Date.now() / 1000);
  const signature = sign({ folder, timestamp });

  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);
  form.append("api_key", API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Upload failed for ${filename}`);
  }
  const data = await res.json();
  return data.secure_url;
}

export async function uploadLocalFile(localPath, folder) {
  const buffer = await readFile(localPath);
  const filename = localPath.split(/[\\/]/).pop();
  return uploadBuffer(buffer, filename, folder);
}

export async function uploadFromUrl(url, folder, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return uploadBuffer(buffer, filename || "image.jpg", folder);
}
