/**
 * Provider-neutral entity access.
 *
 * Feature code should prefer entity(name) over provider-specific SDK objects.
 * This adapter preserves the current CRUD shape while allowing each entity to
 * move to an owned API/database independently.
 */
import { platform } from "./client";

export function entity(name) {
  const model = platform.entities?.[name];
  if (!model) {
    throw new Error(`Unknown platform entity: ${name}`);
  }
  return model;
}

export const data = new Proxy({}, {
  get(_target, name) {
    if (typeof name !== "string") return undefined;
    return entity(name);
  },
});
