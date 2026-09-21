# Blue Platform Independence

VStream is being migrated away from direct Base44 ownership.

## Architectural rule

Application UI and feature code must not import `@/api/base44Client`.
All infrastructure access goes through `src/platform` APIs.

Base44 is currently a **legacy compatibility provider** only. It will be
removed after each capability has an owned replacement and its data has
been migrated and verified.

## Migration order

1. Dependency firewall
2. Authentication and identity
3. Database/entities
4. Object/media/project storage
5. Server functions
6. Blue AI provider router
7. Payments and external integrations
8. Data migration verification
9. Remove Base44 SDK/plugin/functions/config

## Target provider boundaries

- `platform.auth` — sessions, identity, roles and personas
- `platform.entities` — application data
- `platform.storage` — media and project files
- `platform.functions` — server-side application actions
- `platform.ai` — Blue AI router; providers are replaceable
- `platform.payments` — payment provider adapter

No provider should be able to become the architecture of VStream or Blue Academy.

## Safety rule

Do not delete Base44 infrastructure until equivalent owned services are
running and data migration has been verified. Migration happens capability
by capability so the existing VStream backup remains recoverable.
