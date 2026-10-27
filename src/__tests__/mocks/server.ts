/*
This file contains the server setup for the tests.
It's used to start the server and stop it after the tests are done.
It's also used to set up the handlers for the tests.
*/
import { setupServer } from 'msw/node';
import { handlers } from '@/__tests__/mocks/handlers';

export const server = setupServer(...handlers);
