/* 
Centralize route constants
Then use them everywhere:
    navigate(ROUTES.FEED);
    <Link to={ROUTES.PROFILE} />
    <Route path={ROUTES.MESSAGES} />
*/

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/signIn',
  SIGN_UP: '/signup',
  RESET_PASSWORD: '/reset-password',
  FORGOT_PASSWORD: '/forgot-password',
  FEED: '/feed',
  MESSAGES: '/messages',
  DISCOVER: '/discover',
  CONNECTIONS: '/connections',
  PROFILE: '/profile',
  PROFILE_SINGLE: '/profile/:id',
  CHAT: '/chat/:id',
  CREATE_POST: '/create-post',
};
