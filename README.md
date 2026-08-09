# PingUp Frontend

A React + TypeScript + Vite frontend for a social media app UI.

This repository contains the client application for the PingUp social experience, including feed, messaging, connections, discover, profile, and post creation screens.

## Key Features

* React 19 + TypeScript + Vite
* Tailwind CSS styling with custom layout and UI components
* React Router DOM powered routing with protected and public routes
* Lazy-loaded pages with `<Suspense>` for split-chunk loading
* Auth + app shell layout separation via `AuthLayout` and `MainLayout`
* Centralized API client and service layer
* Centralized API error handling
* Authentication token handling through API interceptors
* Type-safe API responses and errors
* Pages:

  * Login
  * Feed
  * Messages
  * Chat
  * Connections
  * Discover
  * Profile
  * Create Post
* Docker compose support for production container builds

## Getting Started

### Prerequisites

* Node.js 20+ / npm
* Docker (optional, for container preview)

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

---

# Project Structure

```text
src/
├── api/
│   ├── axios.ts
│   ├── endpoints.ts
│   └── types.ts
│
├── components/
│   └── ...                 # Shared/reusable UI components
│
├── constants/
│   └── routes.ts
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── ...
│   │
│   ├── feed/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── messages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── connections/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── discover/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── profile/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   └── posts/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── ...
│
├── hooks/
│   └── ...                 # Truly global hooks
│
├── layout/
│   ├── AuthLayout.tsx
│   └── MainLayout.tsx
│
├── pages/
│   ├── Login/
│   ├── Feed/
│   ├── Messages/
│   ├── Chat/
│   ├── Connections/
│   ├── Discover/
│   ├── Profile/
│   └── CreatePost/
│
├── router/
│   ├── AppRouter.tsx
│   └── ProtectedRoute.tsx
│
├── services/
│   └── ...                 # Only truly shared services
│
├── styles/
├── types/
├── App.tsx
└── main.tsx
```

### Main directories

* `src/api` — centralized Axios client, API endpoints, and API-related types
* `src/router` — application routes and protected/public route wrappers
* `src/layout` — authentication and application shell layouts
* `src/pages` — page-level components
* `src/components` — reusable UI components
* `src/hooks` — custom React hooks
* `src/services` — API/service layer
* `src/constants` — shared application constants such as route definitions
* `src/types` — shared TypeScript types
* `src/styles` — global styles and theme tokens

---

# Routing

PingUp uses **React Router DOM** for client-side routing.

The routing architecture separates public authentication pages from authenticated application pages.

## Routing Architecture

```text
BrowserRouter
      │
      ▼
   AppRouter
      │
      ├── Public Routes
      │      └── Login
      │
      └── Protected Routes
             │
             ▼
        MainLayout
             │
             ▼
           Outlet
             │
       ┌─────┼────────┬──────────┐
       ▼     ▼        ▼          ▼
      Feed Messages Profile  Connections
```

## Public Routes

Public routes are accessible without authentication.

Example:

```text
/login
```

## Protected Routes

Authenticated application pages are protected from unauthenticated users.

Examples:

```text
/feed
/messages
/messages/:id
/connections
/discover
/profile
```

If the user is not authenticated, the protected route redirects them to the login page.

## Centralized Route Constants

Route paths are centralized in:

```text
src/constants/routes.ts
```

Example:

```ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FEED: '/feed',
  MESSAGES: '/messages',
  DISCOVER: '/discover',
  CONNECTIONS: '/connections',
  PROFILE: '/profile',
  CHAT: '/messages/:id',
} as const;
```

Using centralized route constants prevents duplicated route strings throughout the application.

## Dynamic Routes

The chat page uses a dynamic route:

```text
/messages/:id
```

For example:

```text
/messages/123
```

The chat component can retrieve the conversation ID using:

```tsx
import { useParams } from 'react-router-dom';

const { id } = useParams();
```

## Layout Routes

Shared application UI is handled through layouts.

The authenticated application uses `MainLayout` for common elements such as:

* Navigation
* Sidebar
* Application shell
* Shared page structure

Nested routes are rendered using React Router's `<Outlet />`.

```tsx
function MainLayout() {
  return (
    <>
      <Navbar />
      <Sidebar />

      <main>
        <Outlet />
      </main>
    </>
  );
}
```

## Lazy Loading

Page-level components are lazy-loaded to improve initial loading performance.

```tsx
const Feed = lazy(() => import('@/pages/Feed'));
const Messages = lazy(() => import('@/pages/Messages'));
const Profile = lazy(() => import('@/pages/Profile'));
```

Routes are rendered inside `Suspense`:

```tsx
<Suspense fallback={<Loading />}>
  <AppRouter />
</Suspense>
```

This allows the application to split page code into separate chunks instead of loading every page on the initial request.

## 404 Handling

Unknown routes are handled with a fallback route:

```tsx
<Route
  path="*"
  element={<NotFound />}
/>
```

---

# API Integration

The application uses a centralized API architecture to separate UI components from HTTP communication.

## API Architecture

```text
React Component
      │
      ▼
 Custom Hook
      │
      ▼
 Service Layer
      │
      ▼
 Axios API Client
      │
      ▼
 Interceptors
      │
      ▼
 Backend API
```

This separation keeps API logic out of page components and makes the application easier to maintain and test.

## Axios API Client

A centralized Axios instance is responsible for communicating with the backend API.

Example:

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

Instead of making requests directly throughout the application:

```ts
axios.get('http://localhost:3000/api/users');
```

the application uses the centralized client:

```ts
api.get('/users');
```

## Environment Configuration

The API URL is configured using Vite environment variables.

### `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

### Production

```env
VITE_API_URL=https://api.example.com/api
```

Only environment variables prefixed with `VITE_` are exposed to the frontend.

> Secrets must never be stored in frontend environment variables because Vite variables are included in the client-side application.

---

# API Endpoints

API endpoints are centralized to avoid scattering URL strings throughout the application.

Example:

```ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },

  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const;
```

Services can then use:

```ts
api.post(API_ENDPOINTS.AUTH.LOGIN, data);
```

instead of hardcoding:

```ts
api.post('/auth/login', data);
```

---

# Service Layer

API operations are encapsulated inside services.

For example:

```ts
export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    data
  );

  return response.data;
};
```

The component does not need to know whether the request uses Axios, fetch, or another HTTP client.

The responsibility is separated:

```text
Component
   ↓
auth.service.ts
   ↓
axios.ts
   ↓
Backend
```

This makes the API layer reusable and easier to test.

---

# Authentication

Authentication tokens are attached to requests through an Axios request interceptor.

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

This means authenticated requests automatically include:

```http
Authorization: Bearer <access-token>
```

without requiring every service to manually add the header.

---

# API Error Handling

API errors are handled centrally so the application has a consistent error-handling strategy.

## Error Flow

```text
Backend API
     │
     ▼
 Axios
     │
     ▼
Response Interceptor
     │
     ▼
 Error Parser
     │
     ▼
 Service
     │
     ▼
 Component
     │
     ▼
 User-friendly UI
```

## Centralized Error Type

API errors use a predictable structure:

```ts
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}
```

This allows different backend errors to be normalized into one frontend format.

## Error Parser

A centralized utility converts Axios and other errors into the application's `ApiError` format.

```ts
export const getApiError = (
  error: unknown
): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response;

    if (response) {
      return {
        message:
          response.data?.message ||
          'Something went wrong. Please try again.',
        status: response.status,
        code: response.data?.code,
        errors: response.data?.errors,
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timed out. Please try again.',
      };
    }

    if (error.request) {
      return {
        message: 'Unable to connect to the server.',
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred.',
  };
};
```

The benefit is that components don't need to understand all possible Axios/network error formats.

---

# HTTP Error Strategy

The application handles common HTTP status codes according to their meaning:

| Status        | Meaning                | Frontend behavior                        |
| ------------- | ---------------------- | ---------------------------------------- |
| `400`         | Bad Request            | Display API/validation message           |
| `401`         | Unauthorized           | Clear authentication / redirect to login |
| `403`         | Forbidden              | Display permission error                 |
| `404`         | Not Found              | Display not-found state                  |
| `409`         | Conflict               | Display conflict message                 |
| `422`         | Validation Error       | Display field-level errors               |
| `429`         | Too Many Requests      | Ask user to retry later                  |
| `500`         | Server Error           | Display generic server error             |
| `502/503`     | Server Unavailable     | Display service unavailable/retry state  |
| Network Error | No response            | Display connection error                 |
| Timeout       | Request exceeded limit | Display retry message                    |

---

# Response Interceptor

The response interceptor handles global API concerns.

Example:

```ts
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('accessToken');
          break;

        case 403:
          console.error('Forbidden');
          break;

        case 404:
          console.error('Resource not found');
          break;

        case 500:
          console.error('Internal server error');
          break;
      }
    }

    return Promise.reject(error);
  }
);
```

The interceptor is intentionally responsible for **global concerns**, while individual components decide how errors should be presented in the UI.

For example, UI toast notifications should generally not be hardcoded inside the Axios interceptor.

---

# Component-Level Error Handling

Components manage their own UI states:

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleLogin = async () => {
  try {
    setLoading(true);
    setError('');

    const response = await login({
      email,
      password,
    });

    localStorage.setItem(
      'accessToken',
      response.accessToken
    );
  } catch (error) {
    const apiError = getApiError(error);

    setError(apiError.message);
  } finally {
    setLoading(false);
  }
};
```

This keeps responsibilities separated:

```text
Axios
  → HTTP communication

Interceptors
  → Global API concerns

Error Parser
  → Normalize errors

Service
  → API operations

Component
  → Loading / success / error UI
```

---

# Validation Errors

The backend can return field-level validation errors:

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email"],
    "password": ["Password is required"]
  }
}
```

The frontend can display the error next to the relevant field:

```tsx
{apiError?.errors?.email?.[0] && (
  <span>
    {apiError.errors.email[0]}
  </span>
)}
```

This provides more useful feedback than displaying a generic error message.

---

# API & Error Handling Principles

The API architecture follows these principles:

* Centralize HTTP configuration.
* Keep API URLs in one place.
* Keep API operations inside service modules.
* Automatically attach authentication tokens.
* Normalize API errors into a predictable format.
* Handle global authentication concerns in interceptors.
* Keep UI error presentation inside components.
* Provide field-level validation errors when available.
* Avoid duplicating API logic across components.
* Keep API logic independent from UI components.
* Use TypeScript types for API requests and responses.

---

# Scripts

* `npm run dev` — start Vite development server
* `npm run build` — compile TypeScript and bundle app for production
* `npm run preview` — preview the production bundle locally
* `npm run lint` — run ESLint across the frontend source

# Notes

* The app uses path aliasing for imports such as `@/pages` and `@/router`.
* The project is configured for strict TypeScript support and modern React features.
* Screenshots are available showing the UI for Feed, Messages, Connections, Discover, Profile, and Create Post screens.
* Routing, API communication, authentication, and error handling are separated into dedicated layers to keep the application maintainable and scalable.
