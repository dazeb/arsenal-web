# Arsenal Web ⚔️

Dark-themed React SPA for Arsenal CLI — the agent-driven offensive security lab.

## Dev

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # Outputs to dist/
pnpm preview   # Preview production build
```

## Deploy (Coolify)

Create a new service in Coolify:

- **Type**: Static Site (or Nixpacks)
- **Build command**: `pnpm install && pnpm build`
- **Output directory**: `dist`
- **Node version**: 20+

Push to this repo — Coolify auto-deploys on push.
