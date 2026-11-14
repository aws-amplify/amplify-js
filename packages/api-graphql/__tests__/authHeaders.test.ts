// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import * as core from '@aws-amplify/core';
import { clearGlobalContext } from '@aws-amplify/core/internals/utils';

import { awsRealTimeHeaderBasedAuth } from '../src/Providers/AWSWebSocketProvider/authHeaders';

// Signing is a crypto boundary — mock it so the IAM path is deterministic in
// jsdom. All other internals (context resolution, handler dispatch) run for real.
jest.mock('@aws-amplify/core/internals/aws-client-utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/aws-client-utils'),
	signRequest: jest.fn(() => ({ headers: { Authorization: 'AWS4-signed' } })),
}));

const appSyncGraphqlEndpoint = 'https://example.appsync-api.us-east-1.amazonaws.com/graphql';

describe('awsRealTimeHeaderBasedAuth context resolution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// No global context — this is the scenario the fix targets.
		clearGlobalContext();
	});

	it('apiKey auth works with no explicit ctx AND no global context (never resolves ctx)', async () => {
		const getGlobalContextSpy = jest.spyOn(core, 'getGlobalContext');

		const result = await awsRealTimeHeaderBasedAuth({
			authenticationType: 'apiKey',
			apiKey: 'da2-test',
			appSyncGraphqlEndpoint,
			region: 'us-east-1',
			canonicalUri: '',
			payload: '',
		});

		expect(result).toEqual(
			expect.objectContaining({ 'x-api-key': 'da2-test' }),
		);
		// The apiKey handler must never touch the (missing) context.
		expect(getGlobalContextSpy).not.toHaveBeenCalled();
	});

	it('none/lambda auth works with no ctx when an Authorization header is provided', async () => {
		const getGlobalContextSpy = jest.spyOn(core, 'getGlobalContext');

		const result = await awsRealTimeHeaderBasedAuth({
			authenticationType: 'none',
			appSyncGraphqlEndpoint,
			region: 'us-east-1',
			canonicalUri: '',
			payload: '',
			additionalCustomHeaders: { Authorization: 'custom-token' },
		});

		expect(result).toEqual(
			expect.objectContaining({ Authorization: 'custom-token' }),
		);
		expect(getGlobalContextSpy).not.toHaveBeenCalled();
	});

	it('userPool auth uses the explicitly provided ctx', async () => {
		const explicitCtx = createMockAmplifyContext(
			{},
			{
				fetchAuthSession: jest.fn().mockResolvedValue({
					tokens: { accessToken: { toString: () => 'per-request-token' } },
				}),
			},
		);

		const result = await awsRealTimeHeaderBasedAuth(
			{
				authenticationType: 'userPool',
				appSyncGraphqlEndpoint,
				region: 'us-east-1',
				canonicalUri: '',
				payload: '',
			},
			explicitCtx,
		);

		expect(explicitCtx.fetchAuthSession).toHaveBeenCalledTimes(1);
		expect(result).toEqual(
			expect.objectContaining({ Authorization: 'per-request-token' }),
		);
	});

	it('iam auth uses the explicitly provided ctx', async () => {
		const explicitCtx = createMockAmplifyContext(
			{},
			{
				fetchAuthSession: jest.fn().mockResolvedValue({
					credentials: {
						accessKeyId: 'AKID',
						secretAccessKey: 'secret',
						sessionToken: 'session',
					},
				}),
			},
		);

		const result = await awsRealTimeHeaderBasedAuth(
			{
				authenticationType: 'iam',
				appSyncGraphqlEndpoint,
				region: 'us-east-1',
				canonicalUri: '/graphql/connect',
				payload: '{}',
			},
			explicitCtx,
		);

		expect(explicitCtx.fetchAuthSession).toHaveBeenCalledTimes(1);
		expect(result).toEqual(
			expect.objectContaining({ Authorization: 'AWS4-signed' }),
		);
	});
});

describe('awsRealTimeHeaderBasedAuth explicit Authorization for token auth modes', () => {
	const createSessionCtx = () =>
		createMockAmplifyContext(
			{},
			{
				fetchAuthSession: jest.fn().mockResolvedValue({
					tokens: { accessToken: { toString: () => 'session-access-token' } },
				}),
			},
		);

	beforeEach(() => {
		jest.clearAllMocks();
		clearGlobalContext();
	});

	it.each(['oidc', 'userPool'] as const)(
		'%s auth sends the Authorization header provided by the caller (e.g. `authToken`)',
		async authenticationType => {
			const ctx = createSessionCtx();

			const result = await awsRealTimeHeaderBasedAuth(
				{
					authenticationType,
					appSyncGraphqlEndpoint,
					region: 'us-east-1',
					canonicalUri: '/connect',
					payload: '{}',
					additionalCustomHeaders: { Authorization: 'caller-provided-token' },
				},
				ctx,
			);

			expect(result).toEqual({
				Authorization: 'caller-provided-token',
				host: 'example.appsync-api.us-east-1.amazonaws.com',
			});
			expect(ctx.fetchAuthSession).not.toHaveBeenCalled();
		},
	);

	it.each(['oidc', 'userPool'] as const)(
		'%s auth falls back to the session access token when no Authorization header is provided',
		async authenticationType => {
			const ctx = createSessionCtx();

			const result = await awsRealTimeHeaderBasedAuth(
				{
					authenticationType,
					appSyncGraphqlEndpoint,
					region: 'us-east-1',
					canonicalUri: '/connect',
					payload: '{}',
					additionalCustomHeaders: { 'x-other-header': 'value' },
				},
				ctx,
			);

			expect(result).toEqual({
				Authorization: 'session-access-token',
				host: 'example.appsync-api.us-east-1.amazonaws.com',
			});
			expect(ctx.fetchAuthSession).toHaveBeenCalledTimes(1);
		},
	);
});
