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
  blue: {
    tools: () => blueRequest("/v1/blue/tools"),
    resources: (type, limit = 50) => blueRequest(`/v1/blue/resources/${encodeURIComponent(type)}?limit=${encodeURIComponent(limit)}`),
    resource: (type, id) => blueRequest(`/v1/blue/resources/${encodeURIComponent(type)}/${encodeURIComponent(id)}`),
    memory: (scope) => blueRequest(`/v1/blue/memory${scope ? `?scope=${encodeURIComponent(scope)}` : ""}`),
    remember: (memory) => blueRequest("/v1/blue/memory", { method: "POST", body: JSON.stringify(memory) }),
    forget: (id) => blueRequest(`/v1/blue/memory/${encodeURIComponent(id)}`, { method: "DELETE" }),
    results: () => blueRequest("/v1/blue/results"),
    createResult: (result) => blueRequest("/v1/blue/results", { method: "POST", body: JSON.stringify(result) }),
    permissions: () => blueRequest("/v1/blue/permissions"),
    setPermissionLevel: (action_level) => blueRequest("/v1/blue/permissions", { method: "PUT", body: JSON.stringify({ action_level }) }),
    actions: () => blueRequest("/v1/blue/actions"),
    requestAction: (request) => blueRequest("/v1/blue/actions", { method: "POST", body: JSON.stringify(request) }),
    approveAction: (id) => blueRequest(`/v1/blue/actions/${encodeURIComponent(id)}/approve`, { method: "POST" }),
    verifyAction: (id, verification) => blueRequest(`/v1/blue/actions/${encodeURIComponent(id)}/verify`, { method: "POST", body: JSON.stringify(verification) }),
  },
  academy: {
    dashboard: () => blueRequest("/v1/academy/me/dashboard"),
    courses: () => blueRequest("/v1/academy/courses"),
    course: (slug) => blueRequest(`/v1/academy/courses/${encodeURIComponent(slug)}`),
    enroll: (courseId) => blueRequest(`/v1/academy/courses/${encodeURIComponent(courseId)}/enroll`, { method: "POST" }),
    setProgress: (enrollmentId, progress_percent) => blueRequest(`/v1/academy/enrollments/${encodeURIComponent(enrollmentId)}/progress`, { method: "PATCH", body: JSON.stringify({ progress_percent }) }),
    submitAssignment: (assignmentId, submission) => blueRequest(`/v1/academy/assignments/${encodeURIComponent(assignmentId)}/submissions`, { method: "POST", body: JSON.stringify(submission) }),
  },
  ai: {
    capabilities: () => blueRequest("/v1/ai/capabilities"),
    conversations: () => blueRequest("/v1/ai/conversations"),
    conversation: (id) => blueRequest(`/v1/ai/conversations/${encodeURIComponent(id)}`),
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
