# ZenoGrid Task — Developer Notes

## How to run it

Assumes Node.js (v18+) is installed. Nothing else is required.

```bash
npm install
npm run dev
```

The app starts at `http://localhost:3000`. It needs a `.env` file with `NEXT_PUBLIC_BASE_API_URL` pointing to the ZenoGrid API (already configured for `https://api.zenogrid.clipnexor.com/v0`).

## What I built

- **Login page** (`/`) — email, password, device name, Stores the auth token and expiry in `localStorage`. Redirects to `/workspace` on success.
- **Create account page** (`/create-account`) — name, email, password + confirmation, workspace name, device name, terms checkbox. Posts to `/auth/register`.
- **Workspace picker** (`/workspace`) — fetches `GET /workspaces`, displays a grid of workspace cards. If only one workspace existed, I would have auto-redirected (commented out).
- **Table picker** (`/workspace/[workspaceId]`) — fetches `GET /workspaces/:id/tables`, displays a grid of table cards. Navigates to the data view.
- **Logout button** (`app/components/log-out.tsx`) — calls `POST /auth/logout`, clears local state, redirects to login.
- **API utility** (`app/lib/api.ts`) — thin fetch wrapper with JSON handling, auth token injection, and HTTP error propagation.

Stack: Next.js 16.3.5

## What I deliberately did not build

- **Row create/update/delete in the data grid** — the API calls are commented out in `data-grid.tsx` because the endpoints returned errors or the request/response format was unclear (see API section below). The UI scaffolding is there but the mutations are stubbed.
- **Undo after row deletion** — the API reportedly returns an `undo_token` with a 30-second window, but I couldn't verify this because the delete endpoint wasn't working. The timeout logic is in place.
- **Responsive mobile layout** — the grid uses basic Tailwind grid classes but isn't optimized for small screens.
- **Loading skeletons / optimistic UI** — all loading states are plain text ("Loading...").
- **Error boundaries** — errors are handled per-component with `useState`, not with React error boundaries.
- **Tests** — no test files. The project has no test framework configured.
- **Middleware / route protection** — there's no Next.js middleware checking for a valid token before rendering protected pages. Anyone can navigate to `/workspace` directly.

## Where I stopped and what I would do next

The most critical gap: **the data grid mutations (create, update, delete rows) are not wired up**. The `saveCell`, `addRow`, and `removeRow` functions in `data-grid.tsx` have their API calls commented out. This is where I stopped.

Next steps, in priority order:

1. **Fix and test the row mutation endpoints** — figure out the exact request format the API expects for creating, updating, and deleting rows. The API docs were unclear on whether cell values go in a flat `cells` object or as top-level fields.
2. **Wire up `saveCell`** — uncomment and test the PUT/PATCH call for updating a single cell. Handle 422 validation errors per-field.
3. **Wire up `addRow`** — uncomment and test the POST call for creating a row. Decide whether to prompt for initial values or create a blank row.
4. **Wire up `removeRow`** — uncomment and test the DELETE call. Implement the undo toast with the `undo_token`.
5. **Add route protection** — create a Next.js middleware that checks `localStorage` for a token and redirects to `/` if missing. (Note: `localStorage` isn't available in middleware, so this would need a cookie-based approach or a client-side check on each protected page.)
6. **Add the missing `[tableId]/page.tsx`** — the `data/` directory has a `[tableId]` folder but no `page.tsx` inside it, so the data grid route is incomplete.
7. **Polish error handling** — unify how API errors are displayed (toast vs. inline banner vs. error boundary).

## API observations — what surprised me, was wrong, or badly documented

**The error handling was silently broken.** The `api.ts` fetch wrapper had its `response.ok` check commented out (`// if (!response.ok) { throw new Error(data.message); }`). This meant every API error — 401, 404, 422, 500 — was returned as if it were a successful response. The login page then tried to extract a token from the error body, found none, and threw the misleading `"Login succeeded, but no authentication token was returned"`. The actual error was `"These credentials do not match our records."` but the frontend never saw it. This was the single most confusing bug to track down because the error message pointed at the wrong problem.

**The response shape is inconsistent across endpoints.** Some endpoints wrap data in `{ data: { ... } }`, others return it at the top level. The workspace list could be `response.data`, `response.workspaces`, or `response` itself. Rows could be `response.rows` or `response.data.rows`. This forced every fetch call to defensively try three different paths: `response?.data ?? response?.workspaces ?? response`. The API should return a consistent envelope format across all endpoints.

**Registration doesn't return a token.** The create-account page calls `POST /auth/register` and gets back a success message, but no token. This means after registering, the user has to manually navigate back to login and sign in again. Most auth flows return a token on registration so the user is immediately logged in. If this is intentional, it should be documented. If not, it's a missing feature.

**The row update/delete endpoints are unclear.** The API docs (if they exist beyond the Postman collection) don't clearly specify whether cell values for a row update go in a flat `{ "cells": { "field_key": "value" } }` structure or as `{ "field_key": "value" }` at the top level. The commented-out code guesses at both. The delete endpoint reportedly returns an `undo_token` but there's no documentation on how to use it or how long it lives.

**No rate limiting or pagination metadata.** The rows endpoint uses cursor-based pagination, which is fine, but the cursor value is an opaque string with no documentation on format or behavior. There's no `X-RateLimit-*` headers or any guidance on request limits.

**The `device_name` field on login is unusual.** Most auth APIs don't require a device name for login. It's unclear what this is used for — device tracking? Session management? If it's required, the error message when it's missing should be clear about why.
