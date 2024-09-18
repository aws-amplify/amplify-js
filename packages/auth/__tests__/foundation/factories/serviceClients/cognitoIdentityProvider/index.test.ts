import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import * as serviceClients from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/constants';

import { mockServiceClientAPIConfig } from './testUtils/data';

jest.mock('@aws-amplify/core/internals/aws-client-utils/composers', () => ({
	...jest.requireActual(
		'@aws-amplify/core/internals/aws-client-utils/composers',
	),
	composeServiceApi: jest.fn(),
}));

export const mockComposeServiceApi = jest.mocked(composeServiceApi);

describe('service clients', () => {
	const serviceClientFactories = Object.keys(serviceClients);

	afterEach(() => {
		mockComposeServiceApi.mockClear();
	});

	test.each(serviceClientFactories)(
		'factory `%s` should invoke composeServiceApi with expected parameters',
		serviceClientFactory => {
			// eslint-disable-next-line import/namespace
			serviceClients[serviceClientFactory](mockServiceClientAPIConfig);

			expect(mockComposeServiceApi).toHaveBeenCalledWith(
				expect.any(Function),
				expect.any(Function),
				expect.any(Function),
				expect.objectContaining({
					...DEFAULT_SERVICE_CLIENT_API_CONFIG,
					...mockServiceClientAPIConfig,
				}),
			);
		},
	);
});
