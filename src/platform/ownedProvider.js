import { blueRequest } from "./http";

/**
 * First owned backend provider.
 * Capabilities can be enabled one-by-one while legacy services remain available.
 */
export const ownedProvider = {
  health: () => blueRequest("/health"),
  auth: {
    me: () => blueRequest("/v1/auth/me"),
    logout: () => blueRequest("/v1/auth/logout", { method: "POST" }),
  },
  ai: {
    generate: (request) =>
      blueRequest("/v1/ai/generate", {
        method: "POST",
        body: JSON.stringify(request),
      }),
  },
  storage: {
    upload: (file, metadata = {}) => {
      const body = new FormData();
      body.append("file", file);
      body.append("metadata", JSON.stringify(metadata));
      return blueRequest("/v1/storage/upload", { method: "POST", body });
    },
  },
};
