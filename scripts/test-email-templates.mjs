import { sendOtpEmail, sendPasswordResetEmail, sendAmcReminderEmail } from "../lib/brevo.js";

const TO = "hvimal605@gmail.com";
const NAME = "Vimal";

async function run() {
  await sendOtpEmail({ to: TO, name: NAME, code: "482913", purpose: "signup" });
  console.log("Sent: OTP / verify-email template");

  await sendPasswordResetEmail({ to: TO, name: NAME, token: "test-preview-token-123" });
  console.log("Sent: Password reset template");

  await sendAmcReminderEmail({
    to: TO,
    name: NAME,
    amcNumber: "AMC-2026-00417",
    planName: "Residential Gold Plan",
    expiryDate: "2026-10-05",
    daysRemaining: 15,
  });
  console.log("Sent: AMC renewal reminder template");
}

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
