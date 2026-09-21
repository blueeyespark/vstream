import { auth } from "./auth";
import { blueRequest } from "./http";

export const platform = {
  auth,
  functions: {
    invoke: (name, payload = {}) =>
      blueRequest(`/v1/functions/${encodeURIComponent(name)}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  storage: {
    upload: ({ file, ...metadata }) => {
      const body = new FormData();
      body.append("file", file);
      body.append("metadata", JSON.stringify(metadata));
      return blueRequest("/v1/storage/upload", { method: "POST", body });
    },
  },
  media: {
    generateImage: (request) =>
      blueRequest("/v1/media/generate-image", {
        method: "POST",
        body: JSON.stringify(request),
      }),
  },
  ai: {
    generate: (request) =>
      blueRequest("/v1/ai/generate", {
        method: "POST",
        body: JSON.stringify(request),
      }),
  },
};

export const platformProvider = "blue-owned";
