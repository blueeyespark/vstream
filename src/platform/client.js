/**
 * Blue Platform compatibility gateway.
 *
 * UI code must import this module instead of importing Base44 directly.
 * Base44 is temporarily the legacy provider behind this boundary while
 * VStream services are migrated to infrastructure we control.
 *
 * Rule: no new code may import @/api/base44Client.
 */
import { base44 as legacyProvider } from "@/api/base44Client";

export const platform = {
  auth: legacyProvider.auth,
  entities: legacyProvider.entities,
  functions: legacyProvider.functions,
  integrations: legacyProvider.integrations,
  users: legacyProvider.users,
};

// Provider-neutral AI facade. Components should use platform.ai.generate()
// rather than reaching into a provider-specific integration tree.
platform.ai = {
  generate: (request) => legacyProvider.integrations.Core.InvokeLLM(request),
};

export const platformProvider = "legacy-base44";
