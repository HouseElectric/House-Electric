import { supabase } from "./supabase";
import { loadRazorpayScript } from "./loadRazorpayScript";

// type: "invoice" | "amc"
export async function startPayment({ type, invoiceId, planId, renewFromId, name, email, contact, description }) {
  const {
    data: { session },
  } = (await supabase?.auth.getSession()) || { data: {} };
  if (!session) throw new Error("Please sign in to continue.");

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) throw new Error("Could not load the payment gateway. Check your connection and try again.");

  const orderRes = await fetch("/api/payments/create-order", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ type, invoiceId, planId }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(orderData.error || "Could not start payment.");

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "House Electric",
      description,
      order_id: orderData.orderId,
      prefill: { name, email, contact },
      theme: { color: "#F2B01E" },
      handler: async (response) => {
        try {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "content-type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type,
              invoiceId,
              planId,
              renewFromId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed.");
          resolve(verifyData);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    });
    rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed.")));
    rzp.open();
  });
}
