// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createServerRunner as createGenericServerRunner } from 'aws-amplify/adapter-core';

import { createServerRunner } from '../src/createServerRunner';
import { createAuthRouteHandlersFactory } from '../src/auth';

jest.mock('aws-amplify/adapter-core');
jest.mock('../src/auth');

const mockCreateGenericServerRunner = jest.mocked(createGenericServerRunner);
const mockCreateAuthRouteHandlersFactory = jest.mocked(
	createAuthRouteHandlersFactory,
);

describe('createServerRunner', () => {
	const mockRunWithAmplifyServerContext = jest.fn();
	const mockGlobalSettings = {
		isServerSideAuthEnabled: jest.fn().mockReturnValue(false),
		enableServerSideAuth: jest.fn(),
		setRuntimeOptions: jest.fn(),
		getRuntimeOptions: jest.fn().mockReturnValue({}),
		setIsSSLOrigin: jest.fn(),
		isSSLOrigin: jest.fn().mockReturnValue(false),
	};
	const mockResourcesConfig = {
		Auth: {
			Cognito: {
				userPoolId: 'us-east-1_test',
				userPoolClientId: 'testclient',
			},
		},
	};

	beforeEach(() => {
		mockCreateGenericServerRunner.mockReturnValue({
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			resourcesConfig: mockResourcesConfig,
			globalSettings: mockGlobalSettings,
		});
		mockCreateAuthRouteHandlersFactory.mockReturnValue(jest.fn() as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('calls createGenericServerRunner with config and runtimeOptions', () => {
		createServerRunner({ config: mockResourcesConfig } as any);

		expect(mockCreateGenericServerRunner).toHaveBeenCalledWith({
			config: mockResourcesConfig,
			runtimeOptions: undefined,
			createCookieStorageAdapter: expect.any(Function),
		});
	});

	it('returns runWithAmplifyServerContext and createAuthRouteHandlers', () => {
		const result = createServerRunner({ config: mockResourcesConfig } as any);

		expect(result.runWithAmplifyServerContext).toBe(
			mockRunWithAmplifyServerContext,
		);
		expect(typeof result.createAuthRouteHandlers).toBe('function');
	});

	it('passes resourcesConfig and globalSettings to createAuthRouteHandlersFactory', () => {
		createServerRunner({ config: mockResourcesConfig } as any);

		expect(mockCreateAuthRouteHandlersFactory).toHaveBeenCalledWith({
			config: mockResourcesConfig,
			amplifyAppOrigin: process.env.AMPLIFY_APP_ORIGIN,
			globalSettings: mockGlobalSettings,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});
	});

	it('passes runtimeOptions through', () => {
		createServerRunner({
			config: mockResourcesConfig,
			runtimeOptions: { cookies: { sameSite: 'strict' } },
		} as any);

		expect(mockCreateGenericServerRunner).toHaveBeenCalledWith(
			expect.objectContaining({
				runtimeOptions: { cookies: { sameSite: 'strict' } },
			}),
		);
	});
});
