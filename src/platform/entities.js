import { blueRequest } from "./http";

function makeEntity(type) {
  return {
    list: async () => blueRequest(`/v1/entities/${type}`),
    get: async (id) => blueRequest(`/v1/entities/${type}/${id}`),
    create: async (data) => blueRequest(`/v1/entities/${type}`, { method: "POST", body: JSON.stringify(data) }),
    update: async (id, data) => blueRequest(`/v1/entities/${type}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: async (id) => blueRequest(`/v1/entities/${type}/${id}`, { method: "DELETE" }),

    filter: async (criteria = {}) => {
      const query = new URLSearchParams(
        Object.entries(criteria).filter(([, value]) => value !== undefined && value !== null)
      );
      return blueRequest(`/v1/entities/${type}?${query.toString()}`);
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
