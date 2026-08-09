import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
/*
The interceptor should perform actual global HTTP behavior, 
then reject the error so the feature layer can handle the user-facing state.
*/
// intercept responses coming back from the server.
// use() registers two callbacks.
api.interceptors.response.use(
  /*
  There are two possible situations:
  Response
    │
    ├── Success → first function
    │
    └── Error   → second function
  */
  (response) => response, // This handles successful responses, simply returns the response unchanged.

  (error) => { // This handles failed HTTP requests and other Axios failures, The error is an Axios error object.
    if (error.response) { // Did the server actually respond?
        /*
          error.response = {
            status: 404,
            data: {},
            headers: {}
          };

          401 → Unauthorized
          403 → Forbidden
          404 → Not Found
          500 → Server Error
        */
      const { status } = error.response;

      switch (status) {
        case 401:
          /*
            Possible reasons:
            access token expired
            token invalid
            token missing
            session expired
            ==> Unauthorized
            ==> Optional: refresh & Retry original request or logout and redirect to login page

            401
            ↓
            Try refresh token
            ↓
            Refresh successful?
            ├── YES → retry original request
            │
            └── NO → logout
                        ↓
                      /login
          */
          break;

        case 403:
          /*
            The user is authenticated, but doesn't have permission.
            only logs it for development.
            For production, you'd normally let the error propagate:
            break;
            and let the feature decide whether to show:
            You don't have permission to view this page.
          */
          console.error('Forbidden: You do not have permission.');
          break;

        case 404:
          /*
          The requested resource wasn't found.
          ex:
          GET /users/999999
                ↓
          Backend
                ↓
          404 Not Found
          */
          console.error('Resource not found.');
          break;

        case 500:
          /*
            Internal Server Error => Usually something went wrong on the backend.
          */
          console.error('Internal server error.');
          break;

        default:
          /*
          400
          409
          422
          429
          502
          503
          504
          */
          console.error('API error:', status);
      }
    } else if (error.request) { 
      /* 
      The request was made but no response was received (Network failure, server down, CORS issues, etc.)
      It means:
      ---------
      "I handled whatever global behavior I needed to handle, but I still want the original caller to know that the request failed."
      Without this, you can accidentally swallow the error.
      
      */
      console.error('Network error: server did not respond.');
    }

    // passes the error back to the caller.
    return Promise.reject(error);
  }
);

export default api;
/*
the complete flow:
Feed
 │
 │ useFeed()
 ↓
React Query
 │
 │ GET /feed
 ↓
Axios
 │
 ↓
Backend
 │
 ├───────────────┐
 │               │
200              500
 │               │
 ↓               ↓
success       interceptor
 │               │
 ↓               ↓
data         case 500
                 │
                 ↓
          Promise.reject(error)
                 │
                 ↓
             React Query
                 │
                 ↓
             isError
                 │
                 ↓
             Feed UI
                 │
                 ↓
          "Unable to load feed"
*/
