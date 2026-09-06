// Signed, un-transformed uploads only — no eager/on-the-fly transformations
// are requested, so this never burns Cloudinary transformation credits.
// Uploaded URLs are rendered with plain <img> tags (never next/image) so
// they never count against Vercel's Image Optimization quota either.
export async function uploadImage(file, folder = "house-electric") {
  const sigRes = await fetch("/api/cloudinary-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({}));
    throw new Error(err.error || "Could not get an upload signature.");
  }

  const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Upload failed.");
  }

  const data = await uploadRes.json();
  return data.secure_url;
}

export const cloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
