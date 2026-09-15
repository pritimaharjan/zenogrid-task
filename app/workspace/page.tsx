"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { LogOutButton } from "../components/log-out";

type Workspace = {
  id: string;
  name: string;
};

export default function page() {
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/workspaces");

        console.log("Workspaces:", response);

        const data = response?.data ?? response?.workspaces ?? response;

        const list = Array.isArray(data) ? data : [];

        setWorkspaces(list);

        if (list.length === 1) {
          router.replace(`/workspace/${list[0].id}`);
        }
      } catch (err: any) {
        console.error(err);

        setError(err?.message || "Unable to load workspaces.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading workspaces...
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="text-xl font-bold">ZenoGrid</h1>

          <LogOutButton />
        </div>
      </header>

      <section className="mx-auto max-w-6xl p-8">
        <h2 className="mb-2 text-3xl font-bold">Choose a workspace</h2>

        <p className="mb-8 text-gray-500">
          Select the workspace you want to open.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => router.push(`/workspace/${workspace.id}`)}
              className="rounded-xl border bg-white p-6 text-left shadow-sm transition hover:border-black hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">{workspace.name}</h3>

              <p className="mt-2 text-sm text-gray-500">
                Workspace ID: {workspace.id}
              </p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
