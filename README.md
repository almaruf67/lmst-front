# LMST Frontend (Nuxt 4 + TypeScript)

Nuxt 4 SPA with Pinia, Tailwind, and Axios. Backend base URL comes from runtime config. Build UI first using mocks; wire API at the end.

## Quick Start

```bash
pnpm install
pnpm dev    # http://localhost:3009
```

## Scripts

```bash
pnpm build         # Production build
pnpm preview       # Preview on port 3009
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with --fix
pnpm typecheck     # vue-tsc (SFC type checks)
pnpm type-check    # tsc (TS project only)
pnpm test          # Vitest component/composable suite
pnpm test:watch    # Vitest watch mode
pnpm format        # Prettier write
pnpm format:check  # Prettier check
```

## Core Dev Commands

- `pnpm dev` – hot-reload dev server on port 3009.
- `pnpm preview` – serve the production build locally for smoke testing.
- `pnpm lint` – run ESLint using the repo config.
- `pnpm typecheck` – execute `vue-tsc` to validate SFC types before commits.
- `pnpm test` – run the Vitest-powered component suite so regressions are caught before wiring up APIs.

## Runtime Config

- `NUXT_PUBLIC_API_BASE` – REST endpoint root (default `http://localhost:8000/api/v1`).
- `NUXT_PUBLIC_ASSET_BASE` – Absolute origin for media/assets served outside `/api` (default `http://localhost:8000`).
- `NUXT_PUBLIC_WS_URL` – Websocket/Reverb endpoint placeholder (default `ws://localhost:6001`).
- Example:
  ```ts
  const {
    public: { apiBase },
  } = useRuntimeConfig();
  const { data } = await axios.get(`${apiBase}/students`);
  ```

## Environment & Shell Checklist

- Create a `.env` file and set `NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_ASSET_BASE`, and `NUXT_PUBLIC_WS_URL` for your environment (defaults provided in `.env`).
- Tailwind entry lives at `app/assets/css/main.css` with the design tokens that power the UI kit.
- The app shell is defined inside `app/layouts/default.vue`, which wires the sidebar, header, and page container used by every view.

### Example `.env`

Copy the snippet below into `.env` (or `.env.local`) and tweak the origins/ports to match your backend stack. These values line up with the defaults baked into `nuxt.config.ts`.

```env
# Core REST + assets
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
NUXT_PUBLIC_ASSET_BASE=http://localhost:8000

# Realtime + broadcasting
NUXT_PUBLIC_WS_URL=ws://localhost:6001
NUXT_PUBLIC_BROADCAST_AUTH_ENDPOINT=http://localhost:8000/api/broadcasting/auth
NUXT_PUBLIC_REVERB_HOST=127.0.0.1
NUXT_PUBLIC_REVERB_PORT=8080
NUXT_PUBLIC_REVERB_WSS_PORT=443
NUXT_PUBLIC_REVERB_KEY=local-key
NUXT_PUBLIC_REVERB_SCHEME=http
NUXT_PUBLIC_REVERB_WS_PATH=
```

## Shared Infrastructure

- Axios is configured globally via `app/plugins/api.ts`; consume it through the `useApi()` composable so headers, retries, and auth handling stay consistent.
- Authenticated requests automatically attach the bearer token, retry once after refresh, and redirect to `/login` when the session expires.
- All fatal/network errors surface through the Pinia notification store (`app/stores/notifications.ts`), giving the UI a single toast pipeline to subscribe to.

## Project Structure

- `app/pages/**` (file-based routing)
- `app/layouts/**` (default layout)
- `app/components/**` (auto-imported)
- `app/composables/**` (auto-imported, useXxx naming)
- `app/stores/**` (Pinia stores)
- `app/plugins/**` (client/server plugins)
- `app/assets/**` (Tailwind entry at `assets/css/main.css`)

### Suggested Files

- Pages: students, attendance, dashboard
- Composables: `useStudents.ts`, `useAttendance.ts`
- Store: `app/stores/attendance.ts`
- Components: `StudentList.vue`, `AttendanceToolbar.vue`
- Mocks: `app/utils/mock/{students.ts,attendance.ts}`

## API Targets

- Students: `GET /students?class=&section=`, `POST /students`, `GET /students/:id`
- Attendance: `POST /attendance/bulk`, `GET /reports/monthly?month=...`, `GET /dashboard/summary`

## Notes

- Dev/preview run on port 3009 (configured in `package.json`).
- Build all URLs from `runtimeConfig.public.apiBase` to switch environments cleanly.
