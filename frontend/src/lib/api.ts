const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api/v1";

export async function apiGet<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (body.message) {
        message = body.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (body.message) {
        message = body.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body:
        data !== undefined
          ? JSON.stringify(data)
          : undefined,
    }
  );

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (body.message) {
        message = body.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}