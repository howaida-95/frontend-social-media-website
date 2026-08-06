/* 
Centralize route constants
Then use them everywhere:
    navigate(ROUTES.FEED);
    <Link to={ROUTES.PROFILE} />
    <Route path={ROUTES.MESSAGES} />
*/

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FEED: '/feed',
  MESSAGES: '/messages',
  DISCOVER: '/discover',
  CONNECTIONS: '/connections',
  PROFILE: '/profile',
  PROFILE_SINGLE: '/profile/:id',
  CHAT: '/chat/:id',
  CREATE_POST: '/create-post',
};
