// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	TextDecoder as NodeTextDecoder,
	TextEncoder as NodeTextEncoder,
} from 'util';

import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { Amplify, KeyValueStorageInterface } from '@aws-amplify/core';

import { cognitoUserPoolsTokenProvider } from '../../src/providers/cognito/tokenProvider';
import { server } from '../mocks/server';

// Polyfill TextEncoder/TextDecoder for Node.js environment
// This must be done before any imports that use these globals
if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = NodeTextEncoder as any;
}
if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = NodeTextDecoder as any;
}

// Mock the textEncoder utility to use Node.js TextEncoder
vi.mock('../../src/providers/cognito/utils/textEncoder', () => ({
	textEncoder: {
		convert(input: string): Uint8Array {
			return new NodeTextEncoder().encode(input);
		},
	},
}));

// Mock the dispatchSignedInHubEvent to avoid SRP complexity in integration tests
vi.mock('../../src/providers/cognito/utils/dispatchSignedInHubEvent', () => ({
	dispatchSignedInHubEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock getNewDeviceMetadata to return device metadata directly
// This avoids the complexity of SRP device authentication in integration tests
vi.mock('../../src/providers/cognito/utils/getNewDeviceMetadata', () => ({
	getNewDeviceMetadata: vi
		.fn()
		.mockImplementation(async ({ newDeviceMetadata }) => {
			if (!newDeviceMetadata) return undefined;

			// Return the device metadata with a mock random password
			return {
				deviceKey: newDeviceMetadata.DeviceKey,
				deviceGroupKey: newDeviceMetadata.DeviceGroupKey,
				randomPassword: 'mock-random-password-12345',
			};
		}),
}));

// In-memory storage implementation for testing
class MemoryStorage implements KeyValueStorageInterface {
	store: Record<string, string> = {};

	async setItem(key: string, value: string): Promise<void> {
		this.store[key] = value;
	}

	async getItem(key: string): Promise<string | null> {
		return this.store[key] ?? null;
	}

	async removeItem(key: string): Promise<void> {
		delete this.store[key];
	}

	async clear(): Promise<void> {
		this.store = {};
	}
}

// Create a single memory storage instance to be reused
const memoryStorage = new MemoryStorage();

// Auth configuration for all tests
const authConfig = {
	Cognito: {
		userPoolId: 'us-west-2_test123',
		userPoolClientId: 'test-client-id',
	},
};

// Configure Amplify and token provider once for all tests
beforeAll(() => {
	// Configure token provider with memory storage and auth config
	// IMPORTANT: This must be done BEFORE any auth operations
	cognitoUserPoolsTokenProvider.setKeyValueStorage(memoryStorage);
	cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);

	// Configure Amplify with auth config AND token provider
	Amplify.configure(
		{
			Auth: authConfig,
		},
		{
			Auth: {
				tokenProvider: cognitoUserPoolsTokenProvider,
			},
		},
	);

	// Establish API mocking
	server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers and clear storage after each test
afterEach(async () => {
	server.resetHandlers();
	// Clear storage to prevent test interference
	await memoryStorage.clear();
});

// Clean up after all tests are done
afterAll(() => {
	server.close();
});
