"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
      device_name: formData.get("device_name"),
    };

    try {
      // console.log("Login payload:", payload);

      const response = await api.post("/auth/login", payload);

      // console.log("Login response:", response);

      const token = response?.token ?? response?.data?.token;

      const expiresAt = response?.expires_at ?? response?.data?.expires_at;

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned.",
        );
      }

      localStorage.setItem("token", token);

      if (expiresAt) {
        localStorage.setItem("token_expires_at", expiresAt);
      }

      router.replace("/workspace");
    } catch (err: any) {
      setError(
        err?.message || "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black">ZenoGrid</h1>

          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-5 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-black"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-black"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="device_name"
              className="mb-2 block text-sm font-medium text-black"
            >
              Device Name
            </label>

            <input
              id="device_name"
              name="device_name"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. My Laptop"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <button type="button" onClick={() => router.push("/create-account")}>
            <p className="mt-2 text-sm text-gray-500">
              Don't have an account?{" "}
              <span className="underline hover:text-black">
                Create one now.
              </span>
            </p>
          </button>
        </form>
      </div>
    </main>
  );
}
