import { supabase } from "./supabase";

export async function uploadImage(file, folder = "house-electric") {
  const {
    data: { session },
  } = (await supabase?.auth.getSession()) || { data: {} };
  if (!session) {
    throw new Error("You must be signed in as an admin to upload images.");
  }

  const authRes = await fetch("/api/imagekit-auth", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!authRes.ok) {
    const err = await authRes.json().catch(() => ({}));
    throw new Error(err.error || "Could not get an upload signature.");
  }
  const { token, expire, signature, publicKey, urlEndpoint } = await authRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name || `upload-${Date.now()}`);
  formData.append("publicKey", publicKey);
  formData.append("signature", signature);
  formData.append("expire", expire);
  formData.append("token", token);
  formData.append("folder", folder);
  formData.append("useUniqueFileName", "true");

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err?.message || "Upload failed.");
  }

  const data = await uploadRes.json();
  return data.url;
}

export const imagekitConfigured = !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
