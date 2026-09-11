"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import AuthShowcase from "@/components/AuthShowcase";
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon, UsersIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-4 text-[14.5px] text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-yellow/15 disabled:bg-cream disabled:text-body";
const passwordInputClass = inputClass.replace("pr-4", "pr-11");

export default function RegisterPage() {
  const { signIn, supabaseReady } = useCustomerAuth();
  const router = useRouter();
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purpose: "signup", ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInfo(`We've sent a 6-digit code to ${form.email}`);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otp, purpose: "signup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await signIn(form.email, form.password);
      router.replace("/account");
    } catch (err) {
      setError(err.message || "Verification failed.");
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
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 inline-flex items-center justify-center lg:hidden">
              <Image src="/logo.jpg" alt="House Electric" width={240} height={60} className="h-10 w-auto object-contain" />
            </Link>
            <h1 className="text-[26px] font-extrabold text-ink">{step === "form" ? "Create Your Account" : "Verify Your Email"}</h1>
            <p className="mt-1.5 text-[13.5px] text-body">
              {step === "form"
                ? "Track service requests, quotations, invoices & your AMC in one place."
                : `Enter the 6-digit code sent to ${form.email}`}
            </p>
          </div>

          {!supabaseReady && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
              Account system is not configured yet.
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
              {error}
            </div>
          )}
          {info && step === "otp" && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">{info}</div>
          )}

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">Full Name</label>
                  <div className="relative">
                    <UsersIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                    <input required value={form.name} onChange={set("name")} disabled={!supabaseReady} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">Email Address</label>
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={set("email")}
                      disabled={!supabaseReady}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">Mobile Number</label>
                  <div className="relative">
                    <PhoneIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                    <input
                      type="tel"
                      required
                      value={form.mobile}
                      onChange={set("mobile")}
                      disabled={!supabaseReady}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">Password</label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={form.password}
                      onChange={set("password")}
                      disabled={!supabaseReady}
                      className={passwordInputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-body/60 hover:text-ink"
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !supabaseReady}
                  className="w-full rounded-xl bg-yellow py-3.5 text-[14.5px] font-extrabold text-ink shadow-[0_10px_28px_-8px_rgba(242,176,30,0.7)] transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_14px_32px_-8px_rgba(242,176,30,0.85)] disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
                >
                  {loading ? "Sending code…" : "Send Verification Code"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-center text-[22px] font-bold tracking-[0.4em] text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-yellow/15"
                    placeholder="••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-yellow py-3.5 text-[14.5px] font-extrabold text-ink shadow-[0_10px_28px_-8px_rgba(242,176,30,0.7)] transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_14px_32px_-8px_rgba(242,176,30,0.85)] disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
                >
                  {loading ? "Verifying…" : "Verify & Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full text-center text-[13px] font-bold text-body hover:text-ink"
                >
                  Change details
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {step === "form" && (
            <p className="mt-7 text-center text-[13px] text-body">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-ink underline underline-offset-4 hover:text-yellow-dark">
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </main>
  );
}
