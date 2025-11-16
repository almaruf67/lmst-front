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

## Runtime Config

- Env var: `NUXT_PUBLIC_API_BASE` (default: `http://localhost:8000/api/v1`)
- Example:
  ```ts
  const {
    public: { apiBase },
  } = useRuntimeConfig();
  const { data } = await axios.get(`${apiBase}/students`);
  ```

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
