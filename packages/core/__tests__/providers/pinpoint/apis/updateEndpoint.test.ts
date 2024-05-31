// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getClientInfo } from '../../../../src/utils/getClientInfo';
import { updateEndpoint as clientUpdateEndpoint } from '../../../../src/awsClients/pinpoint';
import { cacheEndpointId } from '../../../../src/providers/pinpoint/utils/cacheEndpointId';
import {
	clearCreatedEndpointId,
	createEndpointId,
} from '../../../../src/providers/pinpoint/utils/createEndpointId';
import { getEndpointId } from '../../../../src/providers/pinpoint/utils/getEndpointId';
import { updateEndpoint } from '../../../../src/providers/pinpoint/apis';
import { amplifyUuid } from '../../../../src/utils/amplifyUuid';
import {
	appId,
	category,
	clientDemographic,
	credentials,
	endpointId,
	identityId,
	region,
	userAttributes,
	userId,
	userProfile,
	uuid,
} from '../testUtils/data';

import { getExpectedInput } from './testUtils/getExpectedInput';

jest.mock('../../../../src/awsClients/pinpoint');
jest.mock('../../../../src/providers/pinpoint/utils/cacheEndpointId');
jest.mock('../../../../src/providers/pinpoint/utils/createEndpointId');
jest.mock('../../../../src/providers/pinpoint/utils/getEndpointId');
jest.mock('../../../../src/utils/amplifyUuid');
jest.mock('../../../../src/utils/getClientInfo');

describe('Pinpoint Provider API: updateEndpoint', () => {
	const createdEndpointId = 'created-endpoint';
	const demographic = {
		appVersion: 'user-app-version',
		locale: 'user-locale',
		make: 'user-make',
		model: 'user-model',
		modelVersion: 'user-model-version',
		platform: 'user-platform',
		platformVersion: 'user-platform-version',
		timezone: 'user-timezone',
	};
	// assert mocks
	const mockAmplifyUuid = amplifyUuid as jest.Mock;
	const mockCacheEndpointId = cacheEndpointId as jest.Mock;
	const mockClearCreatedEndpointId = clearCreatedEndpointId as jest.Mock;
	const mockCreateEndpointId = createEndpointId as jest.Mock;
	const mockClientUpdateEndpoint = clientUpdateEndpoint as jest.Mock;
	const mockGetClientInfo = getClientInfo as jest.Mock;
	const mockGetEndpointId = getEndpointId as jest.Mock;

	beforeAll(() => {
		mockAmplifyUuid.mockReturnValue(uuid);
		mockCreateEndpointId.mockReturnValue(createdEndpointId);
		mockGetClientInfo.mockReturnValue(clientDemographic);
	});

	beforeEach(() => {
		mockGetEndpointId.mockReturnValue(endpointId);
	});

	afterEach(() => {
		mockCacheEndpointId.mockClear();
		mockClearCreatedEndpointId.mockClear();
		mockCreateEndpointId.mockClear();
		mockClientUpdateEndpoint.mockReset();
		mockGetEndpointId.mockReset();
	});

	it('calls the service API with a baseline input', async () => {
		await updateEndpoint({ appId, category, credentials, region });
		expect(mockClientUpdateEndpoint).toHaveBeenCalledWith(
			{ credentials, region },
			getExpectedInput({}),
		);
	});

	it('calls the service API with user info inside input', async () => {
		const address = 'address';
		const channelType = 'IN_APP';
		const location = {
			city: 'city',
			country: 'country',
			latitude: 47,
			longitude: 122,
			postalCode: 'postal-code',
			region: 'region',
		};
		const metrics = {
			items: 10,
		};
		const optOut = 'ALL';
		await updateEndpoint({
			address,
			appId,
			category,
			channelType,
			credentials,
			optOut,
			region,
			userId,
			userProfile: {
				...userProfile,
				demographic,
				location,
				metrics,
			},
		});
		expect(mockClientUpdateEndpoint).toHaveBeenCalledWith(
			{ credentials, region },
			getExpectedInput({
				address,
				attributes: {
					email: [userProfile.email],
					name: [userProfile.name],
					plan: [userProfile.plan],
					...userProfile.customProperties,
				},
				channelType,
				demographic,
				location,
				metrics,
				optOut,
				userId,
			}),
		);
	});

	it('merges demographics with client info on endpoint creation', async () => {
		mockGetEndpointId.mockReturnValue(undefined);
		const partialDemographic = { ...demographic } as any;
		delete partialDemographic.make;
		delete partialDemographic.model;
		await updateEndpoint({
			appId,
			category,
			credentials,
			region,
			userProfile: {
				demographic: partialDemographic,
			},
		});
		expect(mockClientUpdateEndpoint).toHaveBeenCalledWith(
			{ credentials, region },
			getExpectedInput({
				endpointId: createdEndpointId,
				demographic: {
					...demographic,
					make: clientDemographic.make,
					model: clientDemographic.model,
				},
			}),
		);
	});

	it('does not merge demographics with client info on endpoint update', async () => {
		const partialDemographic = { ...demographic } as any;
		delete partialDemographic.make;
		delete partialDemographic.model;
		await updateEndpoint({
			appId,
			category,
			credentials,
			region,
			userProfile: {
				demographic: partialDemographic,
			},
		});
		expect(mockClientUpdateEndpoint).toHaveBeenCalledWith(
			{ credentials, region },
			getExpectedInput({ demographic: partialDemographic }),
		);
	});

	it('falls back to idenity id on endpoint creation', async () => {
		mockGetEndpointId.mockReturnValue(undefined);
		await updateEndpoint({
			appId,
			category,
			credentials,
			identityId,
			region,
		});
		expect(mockClientUpdateEndpoint).toHaveBeenCalledWith(
			{ credentials, region },
			getExpectedInput({
				endpointId: createdEndpointId,
				userId: identityId,
			}),
		);
	});

	it('does not fall back to idenity id on endpoint update', async () => {
		await updateEndpoint({
			appId,
			category,
			credentials,
			identityId,
			region,
			userAttributes,
		});
		expect(mockClientUpdateEndpoint).toHaveBeenCalledWith(
			{ credentials, region },
			getExpectedInput({ userAttributes }),
		);
	});

	it('creates an endpoint if one is not already cached', async () => {
		mockGetEndpointId.mockReturnValue(undefined);
		await updateEndpoint({ appId, category, credentials, region });
		expect(mockClientUpdateEndpoint).toHaveBeenCalledWith(
			{ credentials, region },
			getExpectedInput({ endpointId: createdEndpointId }),
		);
		expect(mockCacheEndpointId).toHaveBeenCalledWith(
			appId,
			category,
			createdEndpointId,
		);
		expect(mockClearCreatedEndpointId).toHaveBeenCalledWith(appId, category);
	});

	it('does not create an endpoint if previously cached', async () => {
		await updateEndpoint({ appId, category, credentials, region });
		expect(mockCreateEndpointId).not.toHaveBeenCalled();
	});

	it('does not cache endpoint if previously cached', async () => {
		await updateEndpoint({ appId, category, credentials, region });
		expect(mockCacheEndpointId).not.toHaveBeenCalled();
		expect(mockClearCreatedEndpointId).not.toHaveBeenCalled();
	});

	it('throws on update failure', async () => {
		mockClientUpdateEndpoint.mockRejectedValue(new Error());
		await expect(
			updateEndpoint({ appId, category, credentials, region }),
		).rejects.toThrow();
	});

	it('clears a created endpoint on update failure', async () => {
		mockGetEndpointId.mockReturnValue(undefined);
		mockClientUpdateEndpoint.mockRejectedValue(new Error());
		await expect(
			updateEndpoint({ appId, category, credentials, region }),
		).rejects.toThrow();
		expect(mockClearCreatedEndpointId).toHaveBeenCalledWith(appId, category);
	});
});
