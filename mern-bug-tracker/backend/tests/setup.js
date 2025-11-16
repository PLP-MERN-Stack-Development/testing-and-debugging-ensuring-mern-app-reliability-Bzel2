// Global test setup
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Suppress console output during testing unless needed
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock process.exit to prevent tests from actually exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

afterAll(() => {
  mockExit.mockRestore();
});
