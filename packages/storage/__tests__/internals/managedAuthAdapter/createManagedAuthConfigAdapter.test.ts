// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createManagedAuthConfigAdapter } from '../../../src/internals/managedAuthConfigAdapter';
import { createListLocationsHandler } from '../../../src/internals/managedAuthConfigAdapter/createListLocationsHandler';
import { createLocationCredentialsHandler } from '../../../src/internals/managedAuthConfigAdapter/createLocationCredentialsHandler';

jest.mock(
	'../../../src/internals/managedAuthConfigAdapter/createListLocationsHandler',
);
jest.mock(
	'../../../src/internals/managedAuthConfigAdapter/createLocationCredentialsHandler',
);

describe('createManagedAuthConfigAdapter', () => {
	const region = 'us-foo-2';
	const accountId = 'XXXXXXXXXXXX';
	const credentialsProvider = jest.fn();

	beforeEach(() => {
		jest
			.mocked(createListLocationsHandler)
			.mockReturnValue('LIST_LOCATIONS_FN' as any);
		jest
			.mocked(createLocationCredentialsHandler)
			.mockReturnValue('GET_LOCATION_CREDENTIALS_FN' as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass region to the adapter', () => {
		expect(createManagedAuthConfigAdapter({ region } as any)).toMatchObject({
			region,
		});
	});

	it('should create list locations handler', () => {
		expect(
			createManagedAuthConfigAdapter({
				region,
				accountId,
				credentialsProvider,
			}),
		).toMatchObject({
			listLocations: 'LIST_LOCATIONS_FN',
		});
		expect(createListLocationsHandler).toHaveBeenCalledWith({
			region,
			accountId,
			credentialsProvider,
		});
	});

	it('should create get location credentials handler', () => {
		expect(
			createManagedAuthConfigAdapter({
				region,
				accountId,
				credentialsProvider,
			}),
		).toMatchObject({
			getLocationCredentials: 'GET_LOCATION_CREDENTIALS_FN',
		});
		expect(createLocationCredentialsHandler).toHaveBeenCalledWith({
			region,
			accountId,
			credentialsProvider,
		});
	});
});
