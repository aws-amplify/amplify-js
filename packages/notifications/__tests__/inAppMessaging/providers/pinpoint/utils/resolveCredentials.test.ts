// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { resolveCredentials } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';

describe('resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};

	it('should return the credentials and identityId', async () => {
		const ctx = createMockAmplifyContext();
		(ctx.fetchAuthSession as jest.Mock).mockResolvedValue(credentials);
		expect(await resolveCredentials(ctx)).toStrictEqual(credentials);
	});
});
