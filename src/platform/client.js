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
    uploadVideo: ({ file, ...metadata }) => {
      const body = new FormData();
      body.append("file", file);
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) body.append(key, String(value));
      });
      return blueRequest("/v1/media/video-upload", { method: "POST", body });
    },
    transcodeVideo: (id) => blueRequest(`/v1/media/videos/${id}/transcode`, { method: "POST" }),
    editVideo: (id, edits) => blueRequest(`/v1/media/videos/${id}/edit`, { method: "PATCH", body: JSON.stringify(edits) }),
    generateImage: (request) =>
      blueRequest("/v1/media/generate-image", {
        method: "POST",
        body: JSON.stringify(request),
      }),
  },
  ai: {
    transcribe: (request) =>
      blueRequest("/v1/ai/transcribe", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    generate: (request) =>
      blueRequest("/v1/ai/generate", {
        method: "POST",
        body: JSON.stringify(request),
      }),
  },
};

export const platformProvider = "blue-owned";
