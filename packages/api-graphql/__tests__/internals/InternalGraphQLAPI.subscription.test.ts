// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AMPLIFY_CONTEXT_BRAND, AmplifyContext } from '@aws-amplify/core';

import { InternalGraphQLAPIClass } from '../../src/internals/InternalGraphQLAPI';

function makeBrandedContext(): AmplifyContext {
	const ctx = {
		resourcesConfig: {},
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue({}),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	};
	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, { value: true });

	return ctx as unknown as AmplifyContext;
}

const SUBSCRIPTION_QUERY = `subscription OnFoo { onFoo { id } }`;

describe('InternalGraphQLAPI subscription context guard (F3.2)', () => {
	it('rejects the server context callback (function) form for subscriptions', () => {
		const api = new InternalGraphQLAPIClass();
		// The callback-function form is only valid for await-able query/mutation
		// operations via the server context manager, never for subscriptions.
		const callbackForm = ((fn: (amplify: any) => Promise<any>) =>
			Promise.resolve()) as any;

		expect(() =>
			api.graphql(callbackForm, { query: SUBSCRIPTION_QUERY }),
		).toThrow('Subscriptions do not support the server context callback form');
	});

	it('routes a branded AmplifyContext through the checked ensureContext path', () => {
		const api = new InternalGraphQLAPIClass();
		const subscribeSpy = jest
			.spyOn(api as any, '_graphqlSubscribe')
			.mockReturnValue('OBSERVABLE');

		const ctx = makeBrandedContext();
		const result = api.graphql(ctx, { query: SUBSCRIPTION_QUERY });

		expect(result).toBe('OBSERVABLE');
		// The already-branded context is forwarded as-is (no re-bridging).
		expect(subscribeSpy).toHaveBeenCalledTimes(1);
		expect(subscribeSpy.mock.calls[0][0]).toBe(ctx);
	});
});
