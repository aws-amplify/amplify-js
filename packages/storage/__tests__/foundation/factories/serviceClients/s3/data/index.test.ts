// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import * as serviceClients from '../../../../../../src/foundation/factories/serviceClients/s3';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from '../../../../../../src/foundation/factories/serviceClients/s3/s3data/constants';

jest.mock('@aws-amplify/core/internals/aws-client-utils/composers', () => ({
	...jest.requireActual(
		'@aws-amplify/core/internals/aws-client-utils/composers',
	),
	composeServiceApi: jest.fn(),
}));

export const mockComposeServiceApi = jest.mocked(composeServiceApi);

describe('service clients', () => {
	const mockClient = jest.fn();
	const serviceClientFactories = Object.keys(
		serviceClients,
	) as (keyof typeof serviceClients)[];

	beforeEach(() => {
		mockComposeServiceApi.mockImplementation(() => {
			return mockClient;
		});
	});

	afterEach(() => {
		mockComposeServiceApi.mockClear();
		mockClient.mockClear();
	});

	it.each(serviceClientFactories)(
		'factory `%s` should invoke composeServiceApi with expected parameters',
		serviceClientFactory => {
			// eslint-disable-next-line import/namespace
			const createClient = serviceClients[serviceClientFactory];
			const client = createClient();
			expect(client).toBe(mockClient);

			expect(mockComposeServiceApi).toHaveBeenCalledWith(
				expect.any(Function),
				expect.any(Function),
				expect.any(Function),
				expect.objectContaining(DEFAULT_SERVICE_CLIENT_API_CONFIG),
			);
		},
	);
});
