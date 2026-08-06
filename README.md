# PingUp Frontend

A React + TypeScript + Vite frontend for a social media app UI.

This repository contains the client application for the PingUp social experience, including feed, messaging, connections, discover, profile, and post creation screens.

## Key Features

- React 19 + TypeScript + Vite
- Tailwind CSS styling with custom layout and UI components
- React Router DOM powered routing with protected and public routes
- Lazy-loaded pages with `<Suspense>` for split-chunk loading
- Auth + app shell layout separation via `AuthLayout` and `MainLayout`
- Pages:
  - Login
  - Feed
  - Messages
  - Chat
  - Connections
  - Discover
  - Profile
  - Create Post
- Docker compose support for production container builds

## Getting Started

### Prerequisites

- Node.js 20+ / npm
- Docker (optional, for container preview)

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Open the app in your browser at the local Vite URL shown in the terminal.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Docker

Build and run the production container:

```bash
docker compose up --build
```

The app will be available at http://localhost:8080.

## Project Structure

- `src/App.tsx` — app entry and router mount
- `src/router` — route definitions, protected/public wrappers
- `src/layout` — authenticated and main app layouts
- `src/pages` — page views for feed, messages, profile, discover, and more
- `src/styles` — global styles and theme tokens
- `src/constants/routes.ts` — centralized route constants
- `src/components` — reusable UI components
- `src/hooks` — custom hooks
- `src/services` — service and API helpers
- `src/types` — shared TypeScript types

## Scripts

- `npm run dev` — start Vite development server
- `npm run build` — compile TypeScript and bundle app for production
- `npm run preview` — preview the production bundle locally
- `npm run lint` — run ESLint across the frontend source

## Notes

- The app uses path aliasing for imports such as `@/pages` and `@/router`.
- The project is configured for strict TypeScript support and modern React features.
- Screenshots are available showing the UI for Feed, Messages, Connections, Discover, Profile, and Create Post screens.
