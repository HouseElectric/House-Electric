"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AuthShowcase from "@/components/AuthShowcase";
import { AlertIcon, CheckCircle, MailIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-4 text-[14.5px] text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-yellow/15";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthShowcase />

      <div className="flex items-center justify-center bg-cream px-4 py-14 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-3xl border border-line/80 bg-white p-7 shadow-[0_20px_60px_-15px_rgba(20,20,20,0.15)] sm:p-9"
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-4 text-center"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle className="h-8 w-8" />
                </span>
                <h1 className="text-[22px] font-extrabold text-ink">Check Your Email</h1>
                <p className="max-w-[34ch] text-[13.5px] text-body">
                  We've sent a password reset link to <strong className="text-ink">{email}</strong>. Click the link in
                  the email to choose a new password.
                </p>
                <p className="mt-1 text-[12.5px] text-muted">The link expires in 30 minutes.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-3 text-[13px] font-bold text-ink underline underline-offset-4 hover:text-yellow-dark"
                >
                  Use a different email
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-8 text-center">
                  <Link href="/" className="mb-6 inline-flex items-center justify-center lg:hidden">
                    <Image src="/logo.jpg" alt="House Electric" width={240} height={60} className="h-10 w-auto object-contain" />
                  </Link>
                  <h1 className="text-[26px] font-extrabold text-ink">Forgot Password</h1>
                  <p className="mt-1.5 text-[13.5px] text-body">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                    <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendLink} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-ink">Email Address</label>
                    <div className="relative">
                      <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-yellow py-3.5 text-[14.5px] font-extrabold text-ink shadow-[0_10px_28px_-8px_rgba(242,176,30,0.7)] transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_14px_32px_-8px_rgba(242,176,30,0.85)] disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
                  >
                    {loading ? "Sending link…" : "Send Reset Link"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-7 text-center text-[13px] text-body">
            <Link href="/login" className="font-bold text-ink underline underline-offset-4 hover:text-yellow-dark">
              Back to Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
