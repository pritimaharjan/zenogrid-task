"use client";
import { useEffect } from "react";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";

export function LogOutButton() {
  const router = useRouter();
  const handleLogOut = async () => {
    try {
      const response = await api.post("/auth/logout");
      // console.log("logout response:", response);
    } catch (err: any) {
      // console.error(err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires_at");
      router.push("/");
    }
  };
  return (
    <button
      onClick={() => handleLogOut()}
      className="rounded border px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-black"
    >
      Log out
    </button>
  );
}
