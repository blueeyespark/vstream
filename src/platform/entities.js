import { blueRequest } from "./http";

function makeEntity(type) {
  return {
    list: async () => blueRequest(`/v1/entities/${type}`),
    get: async (id) => blueRequest(`/v1/entities/${type}/${id}`),
    create: async (data) => blueRequest(`/v1/entities/${type}`, { method: "POST", body: JSON.stringify(data) }),
    update: async (id, data) => blueRequest(`/v1/entities/${type}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: async (id) => blueRequest(`/v1/entities/${type}/${id}`, { method: "DELETE" }),

    // Compatibility with the old SDK while callers are migrated. Filtering is
    // intentionally client-side for now; server-side query support comes next.
    filter: async (criteria = {}) => {
      const rows = await blueRequest(`/v1/entities/${type}`);
      return rows.filter((row) =>
        Object.entries(criteria).every(([key, value]) => row[key] === value)
      );
    },
  };
}

const cache = new Map();
export function entity(name) {
  if (!cache.has(name)) cache.set(name, makeEntity(name));
  return cache.get(name);
}

export const data = new Proxy({}, {
  get(_target, name) {
    if (typeof name !== "string") return undefined;
    return entity(name);
  },
});
