import { createHmac } from "node:crypto";

const CASHFREE_ENV = process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
const CASHFREE_API =
  CASHFREE_ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
const API_VERSION = "2023-08-01";

function authHeaders() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) return null;
  return {
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": API_VERSION,
    "content-type": "application/json",
  };
}

export const cashfreeConfigured = () => !!process.env.CASHFREE_APP_ID && !!process.env.CASHFREE_SECRET_KEY;
export const cashfreeMode = () => CASHFREE_ENV;

// Cashfree requires a valid-looking 10-digit Indian phone number on every order.
function sanitizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return last10.length === 10 ? last10 : "9999999999";
}

// amountRupees: plain rupee amount (e.g. 2499 or 2499.50) — Cashfree wants a decimal rupee amount.
export async function createCashfreeOrder({ orderId, amountRupees, customer, returnUrl, notes }) {
  const headers = authHeaders();
  if (!headers) throw new Error("Cashfree is not configured on the server.");

  const res = await fetch(`${CASHFREE_API}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      order_id: orderId,
      order_amount: Math.round(Number(amountRupees) * 100) / 100,
      order_currency: "INR",
      customer_details: {
        customer_id: customer.id,
        customer_name: customer.name || "Customer",
        customer_email: customer.email || "customer@houseelectric.in",
        customer_phone: sanitizePhone(customer.phone),
      },
      order_meta: {
        return_url: returnUrl,
      },
      order_note: notes,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to create payment order.");
  }
  return res.json();
}

export async function getCashfreeOrderStatus(orderId) {
  const headers = authHeaders();
  if (!headers) throw new Error("Cashfree is not configured on the server.");

  const res = await fetch(`${CASHFREE_API}/orders/${encodeURIComponent(orderId)}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to fetch order status.");
  }
  return res.json(); // { order_status: "PAID" | "ACTIVE" | "EXPIRED" | "TERMINATED", ... }
}

// Returns the cf_payment_id of the successful attempt, if any — used only as a payment
// reference to display; the source of truth for "is this paid" is always order_status.
export async function getCashfreeSuccessfulPaymentId(orderId) {
  const headers = authHeaders();
  if (!headers) return null;
  try {
    const res = await fetch(`${CASHFREE_API}/orders/${encodeURIComponent(orderId)}/payments`, { headers });
    if (!res.ok) return null;
    const payments = await res.json();
    const success = Array.isArray(payments) ? payments.find((p) => p.payment_status === "SUCCESS") : null;
    return success?.cf_payment_id ? String(success.cf_payment_id) : null;
  } catch {
    return null;
  }
}

// Cashfree webhook signature = base64( HMAC_SHA256(secretKey, timestamp + rawBody) ),
// compared against the "x-webhook-signature" header (timestamp comes from "x-webhook-timestamp").
export function verifyCashfreeWebhookSignature({ rawBody, timestamp, signature }) {
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!secretKey || !timestamp || !signature) return false;
  const expected = createHmac("sha256", secretKey).update(timestamp + rawBody).digest("base64");
  return expected === signature;
}
