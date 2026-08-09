import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from "@/constants";
import ProtectedRoute from '@/router/ProtectedRoute'
import MainLayout from '@/layout/MainLayout';
import AuthLayout from '@/layout/AuthLayout';
import PublicRoute from '@/router/PublicRoute';
const SignIn = lazy(() => import('@/pages/auth/SignIn'))
const Feed = lazy(() => import('@pages/Feed'))
const Messages = lazy(() => import('@/pages/Messages'))
const ChatBox = lazy(() => import('@/pages/ChatBox'))
const Connections = lazy(() => import('@/pages/Connections'))
const Discover = lazy(() => import('@/pages/Discover'))
const Profile = lazy(() => import('@/pages/Profile'))
const CreatePost = lazy(() => import('@/pages/CreatePost'))

/*
One <Suspense> wraps all routes here, so the fallback shows on any route change 
while its chunk loads. If you want per-route fallbacks 
(e.g. a skeleton for Feed but a spinner for Chat), 
   <Route path={ROUTES.FEED} element={
     <Suspense fallback={<FeedSkeleton />}>
       <Feed />
     </Suspense>
   } />
wrap each element individually instead:
*/
export default function index() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
          {/* Public group */}
          <Route element={<AuthLayout />}>
            <Route
              path={ROUTES.SIGN_IN}
              element={<PublicRoute><SignIn /></PublicRoute>}
            />
          </Route>
        {/* Protected layout group */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path={ROUTES.HOME} element={ <Feed /> } />
          <Route path={ROUTES.MESSAGES} element={<Messages />} />
          <Route path={ROUTES.CHAT} element={<ChatBox />} />
          <Route path={ROUTES.CONNECTIONS} element={<Connections />} />
          <Route path={ROUTES.DISCOVER} element={<Discover />} />
          <Route path={ROUTES.PROFILE} element={<Profile />}/>
          <Route path={ROUTES.PROFILE_SINGLE} element={<Profile />} />
          <Route path={ROUTES.CREATE_POST} element={<CreatePost />} />
        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Suspense>
  )
}