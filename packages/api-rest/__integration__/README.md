# API REST Integration Tests

This directory contains integration tests for the `@aws-amplify/api-rest` package using Mock Service Worker (MSW) v2 and Vitest.

## Overview

These tests verify the behavior of all public REST API methods:
- `get` - GET requests with query params, headers, and cancellation
- `post` - POST requests with body, headers, and query params
- `put` - PUT requests for full resource updates
- `patch` - PATCH requests for partial updates
- `del` - DELETE requests
- `head` - HEAD requests for checking resource existence
- `isCancelError` - Utility for detecting cancelled requests

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run tests in watch mode
npm run test:integration:watch

# Run tests with coverage
npm run test:integration:coverage
```

## Test Structure

- `setup/` - Vitest setup files that configure MSW
- `mocks/` - MSW request handlers and server configuration
- `*.test.ts` - Individual test files for each HTTP method

## Mock Server

The tests use MSW to intercept HTTP requests and return mock responses. This allows testing without a real backend server.

### Mock Endpoints

All mocks use the base URL: `https://api.example.com`

- `GET /items` - List items
- `GET /items/:id` - Get single item
- `POST /items` - Create item
- `PUT /items/:id` - Update item
- `PATCH /items/:id` - Partially update item
- `DELETE /items/:id` - Delete item
- `HEAD /items/:id` - Check item existence

### Special Endpoints

- `/items/nonexistent` - Returns 404 for testing error handling
- `/items/slow` - Delays response for testing cancellation
- `/items/invalid` - Returns 400 for testing validation errors

## Adding New Tests

1. Create a new test file: `<method>.test.ts`
2. Import the API method from `../src`
3. Configure Amplify in `beforeAll`
4. Write test cases using Vitest's `describe`, `it`, and `expect`
5. Add corresponding mock handlers in `mocks/handlers.ts`

## Debugging

Set the `DEBUG_MSW` environment variable to see intercepted requests:

```bash
DEBUG_MSW=1 npm run test:integration
```
