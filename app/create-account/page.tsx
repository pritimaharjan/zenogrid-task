"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const password = data.get("password") as string;
    const passwordConfirmation = data.get("password_confirmation") as string;

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAgreed) {
      setError("You must accept the terms and conditions.");
      return;
    }

    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      password: password,
      password_confirmation: passwordConfirmation,
      workspace_name: data.get("workspace_name"),
      terms_accepted: termsAgreed,
      device_name: data.get("device_name"),
    };

    setLoading(true);

    try {
      const response = await api.post("/auth/register", payload);

      setSuccess("Account created successfully!");

      form.reset();
      setTermsAgreed(false);
    } catch (error: any) {
      setError(error?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black">ZenoGrid</h1>

          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-black"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              required
              maxLength={120}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-black"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Password */}
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
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={12}
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

            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 12 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-medium text-black"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                required
                minLength={12}
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Workspace */}
          <div>
            <label
              htmlFor="workspace_name"
              className="mb-2 block text-sm font-medium text-black"
            >
              Workspace Name
            </label>

            <input
              id="workspace_name"
              type="text"
              name="workspace_name"
              required
              maxLength={80}
              placeholder="Enter your workspace name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Device Name */}
          <div>
            <label
              htmlFor="device_name"
              className="mb-2 block text-sm font-medium text-black"
            >
              Device Name
            </label>

            <input
              id="device_name"
              type="text"
              name="device_name"
              required
              maxLength={120}
              placeholder="Enter your device name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              id="terms_accepted"
              type="checkbox"
              name="terms_accepted"
              required
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-1 h-4 w-4"
            />

            <label htmlFor="terms_accepted" className="text-sm text-gray-700">
              I agree to the terms and conditions.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
