// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { resolveServerContext } from '../../../../../src/providers/cognito/apis/server/resolveServerContext';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

jest.mock('@aws-amplify/core/internals/adapter-core');

const mockGetAmplifyServerContext = getAmplifyServerContext as jest.Mock;

describe('resolveServerContext', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns the AmplifyContext unchanged when it has a resourcesConfig', () => {
		const ctx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			},
		});

		expect(resolveServerContext(ctx)).toBe(ctx);
		expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
	});

	it('resolves a legacy ContextSpec via getAmplifyServerContext(...).amplify', () => {
		const sentinel = { resolved: 'amplify-server-context' } as any;
		mockGetAmplifyServerContext.mockReturnValue({ amplify: sentinel });
		const contextSpec = { token: { value: 'token' } } as any;

		expect(resolveServerContext(contextSpec)).toBe(sentinel);
		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
	});
});
