# AI Coding Agent Guide — lmst-front (Nuxt 4 + TS)

Nuxt 4 + TypeScript SPA with Pinia, Tailwind, and Axios. Backend base URL is provided via runtime config. Use this guide for fast, consistent contributions.

## Quick Commands

- Dev (port 3009): `pnpm dev` | Preview: `pnpm preview`
- Build: `pnpm build` | Lint: `pnpm lint` | Fix: `pnpm lint:fix`
- Type check (SFC): `pnpm typecheck` | TS: `pnpm type-check`
- Format: `pnpm format` | Check: `pnpm format:check`

## Architecture & Directories

- Source lives under `app/` using Nuxt auto-conventions:
  - Pages: `app/pages/**` (file-based routing)
  - Layouts: `app/layouts/**` (default at `app/layouts/default.vue`)
  - Components: `app/components/**` (auto-imported by Nuxt)
  - Composables: `app/composables/**` (auto-imported, `useXxx` naming)
  - Stores (Pinia): `app/stores/**` (define `useXxxStore` via Pinia)
  - Plugins: `app/plugins/**` (client/server plugins)
  - Assets: `app/assets/**`
- Entry: `app/app.vue` — minimal shell; add layout or global providers here.
- Config: `nuxt.config.ts` — modules, runtime config, CSS, devtools.

## Runtime Config & API Base

- `runtimeConfig.public.apiBase` defaults to `http://localhost:8000/api/v1`
- Override via `.env`: `NUXT_PUBLIC_API_BASE=https://api.example.com/api/v1`
- Axios usage example:
  ```ts
  const {
    public: { apiBase },
  } = useRuntimeConfig();
  const { data } = await axios.get(`${apiBase}/students`);
  ```

## Data, State, Styling

- Axios: use directly or add `app/plugins/axios.ts` for interceptors (confirm before introducing)
- Pinia via `@pinia/nuxt`; define `useXxxStore()` under `app/stores`
- Tailwind via `@nuxtjs/tailwindcss`; ensure `app/assets/css/main.css` exists with directives

## Type Safety & Quality

- TS strict enabled (`nuxt.config.ts`); Nuxt in-process typecheck off → run `pnpm typecheck`
- Keep composables/stores typed; prefer inferred return types and explicit store state

## MCP Usage (for best productivity)

- Docs lookup: use `@mcp_context7` to resolve and fetch library docs (Nuxt, Pinia, Tailwind, Axios) when unsure about APIs or patterns
- Planning/algorithms: use `@mcp_sequentialthinking` to outline non-trivial UI flows or data transforms before coding
- Task visibility: maintain steps with the TODO tool to keep changes scoped and reviewable

## 3–5 Hour Build Path (Backend ready; wire API last)

1. Shell (15m): confirm Tailwind `app/assets/css/main.css`, add minimal layout in `app/layouts/default.vue`
2. Students page (45–60m): page at `app/pages/students/index.vue`, list + search by class/section; back it with `useStudents()` composable and (temporary) mock service; paginate client-side first
3. Attendance page (60–75m): `app/pages/attendance/index.vue`, bulk mark Present/Absent/Late; keep state in a Pinia store; compute per-class percentage locally
4. Dashboard (30–45m): `app/pages/dashboard/index.vue`, cards for today’s summary + basic monthly chart (Chart.js or Nuxt Image + simple bars)
5. Wire API (last 30–45m): swap mock calls to Axios using `apiBase`; keep URLs built from runtime config; add basic error toasts

## API Wiring Targets (swap-in endpoints)

- Students: `GET /students?class=&section=`, `POST /students`, `GET /students/:id`
- Attendance: `POST /attendance/bulk`, `GET /reports/monthly?month=...`, `GET /dashboard/summary`
- Example switch:
  ```ts
  // before: await mock.listStudents(filters)
  // after:
  const { apiBase } = useRuntimeConfig().public;
  const { data } = await axios.get(`${apiBase}/students`, { params: filters });
  ```

## Suggested Frontend Structure (create these)

- Pages: `app/pages/students/index.vue`, `app/pages/attendance/index.vue`, `app/pages/dashboard/index.vue`
- Composables: `app/composables/useStudents.ts`, `app/composables/useAttendance.ts`
- Stores: `app/stores/attendance.ts` (bulk state, selections)
- Components: `app/components/StudentList.vue`, `app/components/AttendanceToolbar.vue`
- Mock services (temp): `app/utils/mock/{students.ts,attendance.ts}` used until API wiring

## Gotchas

- Ports: dev/preview run on 3009 (configured in `package.json`)
- Create `app/assets/css/main.css` with Tailwind directives if styles don’t load
- Prefer building all URLs from `apiBase` to switch environments cleanly

## MCP Quick Prompts

- Docs: "Use @mcp_context7 to fetch Nuxt runtime config docs"; topics: `runtime config`, `auto imports`, `pinia stores`, `axios interceptors`, `tailwind setup`.
- Planning: "Use @mcp_sequentialthinking to outline Students page flow (search, paginate, select class/section) before coding".
- Scope control: Maintain a TODO with 4–6 concrete steps (pages → composables → stores → components → mocks → API swap).

If proposing new patterns (Axios plugin, request layer), note them in the PR description and keep changes minimal and idiomatic to this structure.
