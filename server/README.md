# Blue VStream API

This is the first backend service owned by the VStream/Blue platform.

Current endpoints:
- `GET /health`
- `GET /v1/auth/me` (placeholder until owned sessions are implemented)
- `POST /v1/auth/logout`
- `POST /v1/storage/upload` (owned local-development storage)
- `POST /v1/ai/generate` (explicit 501 until an owned provider is configured)

The local upload implementation is a development stepping stone. Production storage will use the same API contract with an owned/configurable object-storage provider.

Do not put AI/API secrets in the browser app.
