/*
Vitest setup file

This file is used to setup the testing environment for the application.
It is used to configure the testing environment and to setup the mocks for the application.
It is also used to cleanup the testing environment after each test.
It is also used to close the server after all tests are run.

It is also used to clear the localStorage after each test.
It is also used to reset the server after each test.
It is also used to close the server after all tests are run.

*/

import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '@/__tests__/mocks/server';
// Before all tests are run, start the server because we want to test the server-side rendering
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// After each test, cleanup the DOM, reset the server, and clear the localStorage
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});

// After all tests are run, close the server because we don't want to leave the server running after all tests are run
afterAll(() => {
  server.close();
});
