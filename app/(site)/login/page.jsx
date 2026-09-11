"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import AuthShowcase from "@/components/AuthShowcase";
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-4 text-[14.5px] text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-yellow/15 disabled:bg-cream disabled:text-body";
const passwordInputClass = inputClass.replace("pr-4", "pr-11");

export default function LoginPage() {
  const { signIn, supabaseReady } = useCustomerAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/account");
    } catch (err) {
      setError(err?.message === "Invalid login credentials" ? "Invalid email or password." : err?.message || "Login failed.");
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
            <h1 className="text-[26px] font-extrabold text-ink">Welcome Back</h1>
            <p className="mt-1.5 text-[13.5px] text-body">Sign in to manage your services, quotations &amp; AMC.</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">Email Address</label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!supabaseReady}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[13px] font-semibold text-ink">Password</label>
                <Link href="/forgot-password" className="text-[12px] font-bold text-ink underline underline-offset-4 hover:text-yellow-dark">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <motion.button
              type="submit"
              disabled={loading || !supabaseReady}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl bg-yellow py-3.5 text-[14.5px] font-extrabold text-ink shadow-[0_10px_28px_-8px_rgba(242,176,30,0.7)] transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_14px_32px_-8px_rgba(242,176,30,0.85)] disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
            >
              {loading ? "Signing in…" : "Sign In"}
            </motion.button>
          </form>

          <p className="mt-7 text-center text-[13px] text-body">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-ink underline underline-offset-4 hover:text-yellow-dark">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
