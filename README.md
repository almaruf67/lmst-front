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
pnpm format        # Prettier write
pnpm format:check  # Prettier check
```

## Core Dev Commands

- `pnpm dev` – hot-reload dev server on port 3009.
- `pnpm preview` – serve the production build locally for smoke testing.
- `pnpm lint` – run ESLint using the repo config.
- `pnpm typecheck` – execute `vue-tsc` to validate SFC types before commits.

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

## 3–5 Hour Frontend Plan (API last)

1. Shell (15m): ensure Tailwind `app/assets/css/main.css`; minimal layout in `app/layouts/default.vue`.
2. Students (45–60m): `app/pages/students/index.vue` + `useStudents()` + mock service + client pagination.
3. Attendance (60–75m): `app/pages/attendance/index.vue` + Pinia store for bulk state + percentage calc.
4. Dashboard (30–45m): `app/pages/dashboard/index.vue` + simple cards + basic chart.
5. API swap (30–45m): replace mocks with axios using `apiBase`; add basic error toasts.

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
