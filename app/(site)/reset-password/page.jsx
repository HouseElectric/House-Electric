"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AuthShowcase from "@/components/AuthShowcase";
import { AlertIcon, CheckCircle, EyeIcon, EyeOffIcon, LockIcon } from "@/components/icons";

const passwordInputClass =
  "w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-11 text-[14.5px] text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-yellow/15";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setTokenValid(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        setTokenValid(!!data.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setChecking(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
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
            <h1 className="text-[26px] font-extrabold text-ink">Reset Password</h1>
            <p className="mt-1.5 text-[13.5px] text-body">Choose a new password for your account.</p>
          </div>

          {checking ? (
            <div className="py-10 text-center text-[13.5px] text-body">Verifying reset link…</div>
          ) : done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle className="h-7 w-7" />
              </span>
              <p className="text-[15px] font-extrabold text-ink">Password reset successfully</p>
              <p className="text-[13px] text-body">Redirecting you to sign in…</p>
            </div>
          ) : !tokenValid ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
                <AlertIcon className="h-7 w-7" />
              </span>
              <p className="text-[15px] font-extrabold text-ink">This reset link is invalid or expired</p>
              <p className="text-[13px] text-body">Please request a new password reset link.</p>
              <Link
                href="/forgot-password"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink shadow-md hover:bg-yellow-dark"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">New Password</label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">Confirm New Password</label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={passwordInputClass}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-yellow py-3.5 text-[14.5px] font-extrabold text-ink shadow-[0_10px_28px_-8px_rgba(242,176,30,0.7)] transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_14px_32px_-8px_rgba(242,176,30,0.85)] disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
                >
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </form>
            </>
          )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
