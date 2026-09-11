"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, supabaseReady } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: authError } = (await signIn(email, password)) ?? {};
    setLoading(false);
    if (authError) {
      setError(authError.message === "Invalid login credentials" ? "Invalid email or password." : authError.message);
    } else {
      router.replace("/admin");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#141414] p-6">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-9">
        <div className="mb-8 text-center">
          <Image
            src="/logo.jpg"
            alt="House Electric"
            width={1200}
            height={300}
            priority
            className="mx-auto mb-4 h-10 w-auto"
          />
          <h1 className="text-[19px] font-extrabold text-ink">House Electric Admin</h1>
          <p className="mt-1 text-[13.5px] text-body">Sign in to your dashboard</p>
        </div>

        {!supabaseReady && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            <strong>Supabase not configured.</strong> Add environment variables to your .env file.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@houseelectric.com"
              autoComplete="email"
              disabled={!supabaseReady}
              className="w-full rounded-md border border-line px-4 py-3 text-[14.5px] text-ink outline-none focus:border-ink disabled:bg-cream/40 disabled:text-body"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={!supabaseReady}
                className="w-full rounded-md border border-line px-4 py-3 pr-11 text-[14.5px] text-ink outline-none focus:border-ink disabled:bg-cream/40 disabled:text-body"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body/60 hover:text-ink"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !supabaseReady}
            className="w-full rounded-md bg-yellow py-3.5 text-[14.5px] font-bold text-ink transition-colors hover:bg-yellow-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12.5px] text-body">Access restricted to authorized administrators only.</p>
      </div>
    </div>
  );
}
