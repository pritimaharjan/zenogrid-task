"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/app/lib/api";
import { LogOutButton } from "@/app/components/log-out";

type Field = {
  key: string;
  name: string;
  type: string;
  options?: any[];
};

export default function DataPage() {
  const params = useParams();
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
  } | null>(null);

  const workspaceId = params.workspaceId as string;
  const tableId = params.tableId as string;

  const [fields, setFields] = useState<Field[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);

  const [undoToken, setUndoToken] = useState<string | null>(null);
  const [undoLoading, setUndoLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TABLE FIELDS

  async function getTableFields() {
    try {
      setError("");

      const response = await api.get(
        `/workspaces/${workspaceId}/tables/${tableId}?env=dev`,
      );

      console.log("TABLE SCHEMA RESPONSE:", response);

      const tableFields = response?.table?.fields ?? [];

      setFields(tableFields);
    } catch (err: any) {
      setError(err?.message || "Unable to load table fields.");
    }
  }

  // GET ROWS

  // async function loadRows(nextCursor?: string | null) {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     let url = `/workspaces/${workspaceId}/tables/${tableId}/rows?env=dev`;

  //     if (nextCursor) {
  //       url += `&cursor=${encodeURIComponent(nextCursor)}`;
  //     }

  //     const response = await api.get(url);

  //     console.log("ROWS RESPONSE:", response);

  //     const newRows = response?.data ?? [];

  //     const nextCursorValue = response?.meta?.cursor ?? null;

  //     if (nextCursor) {
  //       setRows((oldRows) => [...oldRows, ...newRows]);
  //     } else {
  //       setRows(newRows);
  //     }

  //     setCursor(nextCursorValue);
  //   } catch (err: any) {
  //     console.error(err);

  //     setError(err?.message || "Failed to load rows.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // DELETE ROW

  const removeRow = async (rowId: string) => {
    try {
      setError("");

      const response = await api.delete(
        `/workspaces/${workspaceId}/rows/${rowId}?env=dev`,
      );

      console.log("ROW DELETE RESPONSE:", response);

      // Get undo token from delete response
      const token = response?.undo_token;

      // Remove row from UI
      setRows((oldRows) => oldRows.filter((row) => row.id !== rowId));

      // Save undo token
      if (token) {
        setUndoToken(token);

        // Token expires after 30 seconds
        setTimeout(() => {
          setUndoToken(null);
        }, 30000);
      }
    } catch (err: any) {
      console.error(err);

      setError(err?.message || "Failed to delete row.");
    }
  };

  // UNDO DELETE

  const undoDeleteRow = async () => {
    if (!undoToken) {
      return;
    }

    try {
      setUndoLoading(true);
      setError("");

      const response = await api.post(
        `/workspaces/${workspaceId}/rows/restore?env=dev`,
        {
          undo_token: undoToken,
        },
      );

      console.log("RESTORE RESPONSE:", response);

      setUndoToken(null);

      // await loadRows();
    } catch (err: any) {
      setError(err?.message || "Failed to restore row.");
    } finally {
      setUndoLoading(false);
    }
  };

  async function updateCell(rowId: string, fieldKey: string, newValue: any) {
    try {
      const response = await api.patch(
        `/workspaces/${workspaceId}/rows/${rowId}?env=dev`,
        {
          values: {
            [fieldKey]: newValue,
          },
        },
      );

      console.log("UPDATE CELL RESPONSE:", response);

      const updatedRow = response?.data?.[0];

      if (updatedRow) {
        setRows((oldRows) =>
          oldRows.map((row) => (row.id === rowId ? updatedRow : row)),
        );
      }

      setError("");
    } catch (err: any) {
      console.error("UPDATE CELL ERROR:", err);

      setError(err?.data?.message || err?.message || "Failed to update cell.");
    }
  }

  useEffect(() => {
    if (!workspaceId || !tableId) {
      return;
    }

    async function loadData() {
      await getTableFields();
    }

    loadData();
  }, [workspaceId, tableId]);

  if (loading && rows.length === 0) {
    return <div className="p-6">Loading table...</div>;
  }

  // UI

  return (
    <div className="p-6">
      <header className="mb-6 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="text-xl font-bold">ZenoGrid</h1>

          <LogOutButton />
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      {undoToken && (
        <div className="mb-4 flex items-center justify-between rounded border bg-gray-50 p-4">
          <div className="text-sm">Row deleted.</div>

          <button
            onClick={undoDeleteRow}
            disabled={undoLoading}
            className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {undoLoading ? "Restoring..." : "Undo"}
          </button>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Table Data</h1>

        <p className="mt-1 text-sm text-gray-500">Showing {rows.length} rows</p>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              {fields.map((field) => (
                <th
                  key={field.key}
                  className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold"
                >
                  {field.name}
                </th>
              ))}

              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const isEditing = editingCell?.rowId === row.id;
              return (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {fields.map((field) => {
                    const value = row.values?.[field.key];

                    return (
                      <td
                        key={field.key}
                        className="whitespace-nowrap px-4 py-3 text-sm"
                      >
                        {isEditing ? (
                          <input
                            defaultValue={value ?? ""}
                            onBlur={(e) =>
                              updateCell(row.id, field.key, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            //   className="w-full rounded border px-2 py-1"
                          />
                        ) : value === null ||
                          value === undefined ||
                          value === "" ? (
                          "—"
                        ) : (
                          String(value)
                        )}
                      </td>
                    );
                  })}

                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        setEditingCell(isEditing ? null : { rowId: row.id })
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {isEditing ? "Done" : "Edit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="py-10 text-center text-gray-500">No rows found.</div>
      )}

      {/* {cursor && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => loadRows(cursor)}
            disabled={loading}
            className="rounded border px-5 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )} */}
    </div>
  );
}
