const trimSlash = (value = "") => value.replace(/\/$/, "");

export const blueApiUrl = trimSlash(
  import.meta.env.VITE_BLUE_API_URL || (typeof window !== "undefined" ? window.location.origin : "")
);

export class BlueApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "BlueApiError";
    this.status = status;
    this.details = details;
  }
}

export async function blueRequest(path, options = {}) {
  const response = await fetch(`${blueApiUrl}${path}`, {
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new BlueApiError(
      payload?.message || `Blue API request failed (${response.status})`,
      response.status,
      payload
    );
  }

  return payload;
}
