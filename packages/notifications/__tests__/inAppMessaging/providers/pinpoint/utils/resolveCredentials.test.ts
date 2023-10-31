// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { resolveCredentials } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';

jest.mock('@aws-amplify/core');
const mockFetchAuthSession = fetchAuthSession as jest.Mock;

describe('resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};

	it('should return the credentials and identityId', async () => {
		mockFetchAuthSession.mockReturnValue(credentials);
		expect(await resolveCredentials()).toStrictEqual(credentials);
	});
});
