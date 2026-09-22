# VStream

VStream is the creator platform and CreatorOS layer of the Blue ecosystem.

## Development

Requirements:
- Node.js
- npm

Frontend:

```bash
npm install
npm run dev
```

Owned API:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The frontend defaults to the Blue API at `http://localhost:8787`. Configure `VITE_BLUE_API_URL` when using another API origin.

## Architecture

Application features access infrastructure through `src/platform`. The owned server lives in `server` and provides authentication, entities, storage, media, functions, and provider boundaries.

See `docs/PLATFORM_INDEPENDENCE.md` for the migration and ownership rules.
