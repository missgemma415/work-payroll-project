import '@testing-library/jest-dom';

// Mock TransformStream for test environment
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (typeof TransformStream === 'undefined') {
  // Mock implementation for testing
  (global as unknown as { TransformStream: unknown }).TransformStream = class {
    readable = {};
    writable = {};
  };
}
