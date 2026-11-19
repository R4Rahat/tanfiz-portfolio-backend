# Tanfiz Portfolio — Admin

A private admin panel for managing the Tanfiz portfolio, built on an Express +
MongoDB API with a React single-page app.

- **API:** Express 5, Mongoose, JWT auth (HTTP-only cookie), ImageKit uploads
- **Admin UI:** React 19, Vite, Tailwind CSS v4, React Router, Zustand, Axios

## Project structure

```
client/                 React admin SPA
  src/
    components/         Layout, guards and UI primitives
    pages/              Login, Dashboard, Projects, ProjectEditor, Settings
    store/              Zustand auth + toast stores
    lib/                Axios instance and helpers
server/                 Express API
  src/
    modules/admin/      Admin auth (login, me, logout, seed)
    modules/projects/   Project CRUD, media and thumbnail management
    middleware/         Auth, uploads and error handling
```

## Getting started

### 1. API

```bash
cd server
npm install
npm run dev        # http://localhost:5000
```

Required environment variables in `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URL=mongodb://127.0.0.1:27017/tanviz

ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=change-me

JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
```

On boot the API connects to MongoDB and seeds the admin account from
`ADMIN_EMAIL` / `ADMIN_PASSWORD` if it does not exist yet.

### 2. Admin UI (development)

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:5000`, so cookies and sessions work
without extra CORS setup. Set `VITE_PROXY_TARGET` to change the API target.

### 3. Production (Express serves the SPA)

```bash
cd client
npm run build      # outputs client/dist

cd ../server
npm start          # API + static admin UI on http://localhost:5000
```

`server/src/app.js` serves the first existing build directory:

1. `server/public`
2. `client/dist`

Any non-`/api` GET falls back to `index.html`, so React Router deep links such
as `/projects/:id` work after a refresh. If no build exists, `/` returns a small
JSON message instead.

## Authentication

Every page except `/login` is wrapped in a route guard. On first load the app
calls `GET /api/admin/me`; without a valid session it redirects to `/login` and
returns you to the page you originally requested after signing in.

Login issues an `adminToken` HTTP-only cookie. The browser never stores the JWT
in local storage, and all mutating project endpoints require `requireAdmin`.

## API overview

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/admin/login` | Public | Sign in and set the session cookie |
| GET | `/api/admin/me` | Admin | Current admin profile |
| POST | `/api/admin/logout` | Admin | Clear the session cookie |
| GET | `/api/projects` | Public | List projects by display order |
| GET | `/api/projects/slug/:slug` | Public | Get one project by slug |
| POST | `/api/projects` | Admin | Create a project |
| PATCH | `/api/projects/reorder` | Admin | Reorder projects (`{ ids }`) |
| PATCH | `/api/projects/:id` | Admin | Update project details |
| DELETE | `/api/projects/:id` | Admin | Delete a project and its files |
| PUT | `/api/projects/:id/thumbnail` | Admin | Upload/replace cover (`thumbnail`) |
| DELETE | `/api/projects/:id/thumbnail` | Admin | Remove the cover |
| POST | `/api/projects/:id/media` | Admin | Upload media (`files`, max 10) |
| PATCH | `/api/projects/:id/media/reorder` | Admin | Reorder media (`{ ids }`) |
| PATCH | `/api/projects/:id/media/:mediaId` | Admin | Update media alt text |
| DELETE | `/api/projects/:id/media/:mediaId` | Admin | Delete a media item |

## Notes

- Media and cover images are uploaded to ImageKit; files never touch the server
  disk. A project allows up to 20 media items.
- `build` is required before serving the admin app from Express. During local
  development use the Vite dev server instead.
- The admin UI is fully protected: login is the only public screen, and an
  expired session automatically returns you to it.
