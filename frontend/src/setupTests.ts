// src/setupTests.js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Enhanced DOM matchers: toBeInTheDocument, toHaveTextContent, etc.
import '@testing-library/jest-dom/extend-expect';

// User interaction simulation
import '@testing-library/user-event';

// Explicit DOM cleanup between tests (RTL usually handles this, but safe to include)
import { cleanup } from '@testing-library/react';
afterEach(() => {
  cleanup();
});

// Throw on console.error and console.warn to catch runtime errors in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    throw new Error(`Unexpected console.error: ${args.join(' ')}`);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    throw new Error(`Unexpected console.warn: ${args.join(' ')}`);
  });
});

// Optional: Increase default timeout if needed for long async tests
jest.setTimeout(10000); // 10 seconds
