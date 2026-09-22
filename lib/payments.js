import { supabase } from "./supabase";
import { loadCashfreeScript } from "./loadCashfreeScript";

// type: "invoice" | "amc" | "quotation"
export async function startPayment({ type, invoiceId, planId, quotationId, renewFromId, propertyId }) {
  const {
    data: { session },
  } = (await supabase?.auth.getSession()) || { data: {} };
  if (!session) throw new Error("Please sign in to continue.");

  const scriptLoaded = await loadCashfreeScript();
  if (!scriptLoaded) throw new Error("Could not load the payment gateway. Check your connection and try again.");

  const orderRes = await fetch("/api/payments/create-order", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ type, invoiceId, planId, quotationId, renewFromId, propertyId }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(orderData.error || "Could not start payment.");

  const cashfree = window.Cashfree({ mode: orderData.mode === "production" ? "production" : "sandbox" });
  const result = await cashfree.checkout({
    paymentSessionId: orderData.paymentSessionId,
    redirectTarget: "_modal",
  });

  if (result?.error) {
    throw new Error(result.error.message || "Payment cancelled.");
  }

  // Whatever the checkout modal reports, the source of truth is always our own
  // server-side order-status check — never trust the client's claim of success.
  const verifyRes = await fetch("/api/payments/verify", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ orderId: orderData.orderId, type, invoiceId, planId, quotationId, renewFromId }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed.");
  return verifyData;
}
