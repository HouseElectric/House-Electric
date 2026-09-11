import { createHmac } from "node:crypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function authHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export const razorpayConfigured = () => !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

// amountRupees: plain rupee amount (e.g. 2499 or 2499.50) — Razorpay wants integer paise.
export async function createRazorpayOrder({ amountRupees, receipt, notes }) {
  const auth = authHeader();
  if (!auth) throw new Error("Razorpay is not configured on the server.");

  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: auth },
    body: JSON.stringify({
      amount: Math.round(amountRupees * 100),
      currency: "INR",
      receipt,
      notes,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.description || "Failed to create payment order.");
  }
  return res.json();
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}

export function verifyWebhookSignature({ rawBody, signature }) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return expected === signature;
}
