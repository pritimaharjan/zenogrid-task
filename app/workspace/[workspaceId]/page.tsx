"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { LogOutButton } from "@/app/components/log-out";
// import LogoutButton from "../../../components/LogoutButton";

type Table = {
  id: string;
  name: string;
};

export default function WorkspaceTablesPage() {
  const params = useParams();
  const router = useRouter();

  const workspaceId = String(params.workspaceId);

  const [tables, setTables] = useState<Table[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTables() {
      try {
        const response = await api.get(`/workspaces/${workspaceId}/tables`);

        // console.log("Tables:", response);
        // console.log("Rows:", rows);

        const data = response?.data ?? response?.tables ?? response;

        setTables(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || "Unable to load tables.");
      } finally {
        setLoading(false);
      }
    }

    loadTables();
  }, [workspaceId]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="text-xl font-bold">ZenoGrid</h1>

          <LogOutButton />
        </div>
      </header>

      <section className="mx-auto max-w-6xl p-8">
        <button
          onClick={() => router.push("/workspace")}
          className="mb-6 text-sm text-gray-500 hover:text-black"
        >
          ← Workspaces
        </button>

        <h2 className="mb-2 text-3xl font-bold">Choose a table</h2>

        <p className="mb-8 text-gray-500">Select the table you want to open.</p>

        {loading && <p>Loading tables...</p>}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() =>
                router.push(`/workspace/${workspaceId}/data/${table.id}`)
              }
              className="rounded-xl border bg-white p-6 text-left shadow-sm hover:border-black hover:shadow-md"
            >
              <h3 className="font-semibold">{table.name}</h3>

              <p className="mt-2 text-xs text-gray-500">{table.id}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
