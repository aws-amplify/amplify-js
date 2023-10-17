// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';
import { identifyUser } from '../../../../src/providers/pinpoint/apis';
import { IdentifyUserInput } from '../../../../src/providers/pinpoint/types';
import {
	resolveConfig,
	resolveCredentials,
} from '../../../../src/providers/pinpoint/utils';
import { getAnalyticsUserAgentString } from '../../../../src/utils/userAgent';

jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('../../../../src/providers/pinpoint/utils');
jest.mock('../../../../src/utils/userAgent');

describe('Analytics Pinpoint Provider API: identifyUser', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};
	const config = { appId: 'app-id', region: 'region' };
	const userAgentValue = 'user-agent-value';
	// assert mocks
	const mockUpdateEndpoint = updateEndpoint as jest.Mock;
	const mockGetAnalyticsUserAgentString =
		getAnalyticsUserAgentString as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;

	beforeAll(() => {
		mockGetAnalyticsUserAgentString.mockReturnValue(userAgentValue);
		mockResolveConfig.mockReturnValue(config);
		mockResolveCredentials.mockResolvedValue(credentials);
	});

	beforeEach(() => {
		mockUpdateEndpoint.mockClear();
	});

	it('passes through parameter along with Analytics boilerplate to core Pinpoint identifyUser API', async () => {
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {
				customProperties: {
					hobbies: ['biking', 'climbing'],
				},
				email: 'email',
				name: 'name',
				plan: 'plan',
			},
		};
		await identifyUser(input);
		expect(mockUpdateEndpoint).toBeCalledWith({
			...input,
			...credentials,
			...config,
			category: 'Analytics',
			userAgentValue,
		});
	});

	it('passes through service options along with Analytics boilerplate to core Pinpoint identifyUser API', async () => {
		const userAttributes = { hobbies: ['biking', 'climbing'] };
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
		};
		const options: IdentifyUserInput['options'] = {
			userAttributes,
		};
		await identifyUser({ ...input, options });
		expect(mockUpdateEndpoint).toBeCalledWith({
			...input,
			...credentials,
			...config,
			category: 'Analytics',
			userAgentValue,
			userAttributes,
		});
	});
});
