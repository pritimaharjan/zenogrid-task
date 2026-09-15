# ZenoGrid Task — Developer Notes

## How to run

Assumes Node.js v18+ is installed.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

Create a `.env` file with:

```env
NEXT_PUBLIC_BASE_API_URL=https://api.zenogrid.clipnexor.com/v0
```

## What I built

- **Login** (`/`) — email/password authentication, stores the authentication token and expiry in `localStorage`, and redirects to the workspace after successful login.
- **Create account** (`/create-account`) — registration form with name, email, password confirmation, workspace name, device name, and terms acceptance.
- **Workspace picker** (`/workspace`) — fetches the user's workspaces and displays them for selection. Automatically redirects when there is only one workspace.
- **Table picker** (`/workspace/[workspaceId]`) — fetches and displays the workspace's tables.
- **Data grid** — displays the selected table's fields and rows and allows row data to be edited.
- **Row deletion** — implemented the delete-row flow.
- **Logout** — calls the API logout endpoint and clears the locally stored authentication state.
- **API utility** (`app/lib/api.ts`) — centralizes API requests, authentication headers, JSON handling, and HTTP error handling.

### Stack

- Next.js 16.3.5
- React
- TypeScript
- Fetch API

## What I deliberately did not build

Within the available time, I prioritized the core authentication, workspace/table selection, and grid functionality.

The following features are incomplete:

- **Add row** — not completed.
- **Undo after deletion** — not completed. The delete/undo flow needs to be finished using the API's `undo_token` and its 30-second validity window.
- **Cursor pagination** — not completed.
- **Filtering and sorting** — not implemented.
- **Bulk editing, grouping, table creation, and CSV import** — not implemented.

I chose to stop rather than add partially working features and prioritized having the core application flow working.

## Where I stopped and what I would do next

The next priority would be to complete row creation, cursor-based pagination, and the delete/undo flow. After that, I would implement filtering and sorting from the UI using the API's documented query grammar and field-specific operators. I would then improve the loading, empty, expired-token, and validation-error states and add a small amount of testing around the main data-grid interactions.

## API observations

One thing I noticed while working with the API is that response shapes need to be handled carefully across endpoints. Some responses wrap the useful payload inside a `data` property while other responses expose properties at the top level, so I avoided assuming that every endpoint has exactly the same response structure.

The API's validation responses are also important for cell editing because a rejected value needs to be associated with the specific field/cell and the API's validation message should be shown to the user.
