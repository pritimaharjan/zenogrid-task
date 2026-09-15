const base_api_url = process.env.NEXT_PUBLIC_BASE_API_URL;

async function request(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(`${base_api_url}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(err?.message || "Request failed");
  }
}

export const api = {
  get: (endpoint: string) => {
    return request(endpoint, { method: "GET" });
  },

  post: (endpoint: string, data?: unknown) => {
    return request(endpoint, { method: "POST", body: JSON.stringify(data) });
  },
  put: (endpoint: string, data?: unknown) => {
    return request(endpoint, { method: "PUT", body: JSON.stringify(data) });
  },
  patch: (endpoint: string, data?: unknown) => {
    return request(endpoint, { method: "PATCH", body: JSON.stringify(data) });
  },
  delete: (endpoint: string) => {
    return request(endpoint, { method: "DELETE" });
  },
};
