// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveCredentials } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

jest.mock('@aws-amplify/core');

const mockCtx = createMockAmplifyContext();

describe('resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};

	it('should return the credentials and identityId', async () => {
		(mockCtx.fetchAuthSession as jest.Mock).mockReturnValue(credentials);
		expect(await resolveCredentials(mockCtx)).toStrictEqual(credentials);
	});
});
