# Roomifier

Turn a 2D floor plan into a photorealistic 3D render. Upload a plan, generate a render with AI, compare before/after with a slider, and save/share the result.

Roomifier has **no first-party backend** — auth, storage, hosting, and AI all run through the [Puter.js](https://developer.puter.com/) SDK, plus one small Puter Worker for project CRUD. There's no database or server of your own to stand up.

## How it works

1. **Sign in** with a Puter account (free, created in seconds via `puter.auth.signIn()` — no separate account system).
2. **Upload a floor plan** on the home page.
3. **Generate a render** — the plan is sent to `puter.ai.txt2img` with a prompt tuned for clean, top-down architectural renders.
4. **Compare** the original plan against the render with a before/after slider.
5. **Save and share** the project — it's stored under your own Puter account (KV + hosted files), not the developer's.

## Tech stack

| Area      | Choice |
| --------- | ------ |
| Framework | React Router 8 (framework mode: SSR + client) |
| Backend   | None — [Puter.js](https://developer.puter.com/) for auth/storage/hosting/AI, plus one deployed Puter Worker for project CRUD |
| Styling   | Tailwind v4 |
| Language  | TypeScript (strict) |
| Tooling   | npm, Vite |

## Getting started

### Prerequisites

- **Node.js + npm**
- A **Puter account** — sign up free at [puter.com](https://puter.com) (or just let `puter.auth.signIn()` create one for you the first time you use the app)

### 1. Clone and install

```bash
git clone https://github.com/dba-fs/Roomifier.git
cd Roomifier
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

The example file already ships with a working, publicly-shareable `VITE_PUTER_WORKER_URL` — the app works out of the box with no further setup. See [Environment variables](#environment-variables) below for what this does and why it's safe to reuse.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), sign in with Puter, and upload a floor plan.

## Available scripts

| Command             | Description                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`        | Start the dev server with HMR                 |
| `npm run build`       | Production build (`react-router build`)       |
| `npm run start`       | Serve the production build (`react-router-serve`) |
| `npm run typecheck`   | Generate route types and run `tsc --noEmit`   |

There is no lint or test script configured yet.

## Environment variables

| Variable                 | Required | Purpose |
| ------------------------ | -------- | ------- |
| `VITE_PUTER_WORKER_URL`  | No*      | URL of the deployed Puter Worker (`lib/puter.worker.js`) that handles saving/listing/fetching projects. |

\* Technically optional — if unset, project save/list/fetch calls warn to the console and degrade to `null`/`[]` instead of throwing (see `lib/puter.action.ts`). Everything else (sign-in, render generation, image hosting) still works. In practice you want it set so saving/loading projects works.

**Why it's safe to reuse the author's URL:** a Puter Worker doesn't run under the account that deployed it — each request runs under whichever Puter account is signed in in *your* browser (`puter.auth.signIn()`), and reads/writes to *that* account's own storage. Reusing the URL from `.env.local.example` doesn't give anyone access to your data, and doesn't put your usage on the author's account or bill — Puter's user-pays model means AI/storage/hosting costs are billed to whoever is signed in.

`.env.local` itself stays gitignored (see `.gitignore` and `.claude/hooks/protect-files.sh`) — that's a blanket rule for all `.env*` files, independent of whether a given value is sensitive, so a future secret added to the same file can't be committed by accident.

### Deploying your own Worker (optional)

Only needed if you're modifying `lib/puter.worker.js` itself:

1. Open [puter.com](https://puter.com), create/edit `puter.worker.js` with your changes.
2. Right-click the file → **Publish as Worker** → choose a Worker URL → **Publish**.
3. Put that URL in your own `.env.local` as `VITE_PUTER_WORKER_URL`.

Publishing again under the **same** Worker URL updates the code in place; a **different** URL creates a separate, independent worker without touching the original.

## Building for production

```bash
npm run build
```

This produces a server build (SSR is on by default — see `react-router.config.ts`):

```
├── package.json
├── package-lock.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

Serve it with:

```bash
npm run start
```

### Docker

```bash
docker build -t roomifier .
docker run -p 3000:3000 roomifier
```

The containerized app can be deployed to any platform that supports Docker (Fly.io, Railway, Google Cloud Run, AWS ECS, Azure Container Apps, Digital Ocean App Platform, etc.). No environment secrets are required beyond `VITE_PUTER_WORKER_URL` — everything else authenticates per end-user through Puter.js in the browser.

---

Built with [React Router](https://reactrouter.com/) and [Puter.js](https://developer.puter.com/).
