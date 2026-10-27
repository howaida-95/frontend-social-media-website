/*
this file contains utility functions for testing the application
it's used to render the application with the necessary providers and context
it's also used to set up the router and the authentication context
*/
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import AuthProvider from '@/features/auth/context/AuthProvider';

/*

Options is a type that extends the RenderOptions type and adds a route and withAuth property
route is the initial route of the application
withAuth is a boolean that indicates if the application should be rendered with the authentication context
*/
type Options = Omit<RenderOptions, 'wrapper'> & {
  route?: string;
  withAuth?: boolean;
};

/*
renderWithProviders is a function that renders the application with the necessary providers and context
it's used to render the application with the necessary providers and context
it's also used to set up the router and the authentication context
*/
export const renderWithProviders = (
  ui: ReactElement, // the component to render that we want to test
  { 
    route = '/',  // The URL where the component should start: default is the home page
    withAuth = true,  // Whether the test needs authentication:
    ...options 
  }: Options = {},
) => {
  // Wrapper is a function that wraps the component in the necessary providers and context (Put my component inside the environment it needs.")
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const inner = withAuth ? <AuthProvider>{children}</AuthProvider> : children;
    // MemoryRouter is a router designed for environments like tests where you don't need a real browser URL.
    return <MemoryRouter initialEntries={[route]}>{inner}</MemoryRouter>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
};
