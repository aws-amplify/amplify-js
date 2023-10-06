// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid';
import { getClientInfo } from '../../../../src/utils/getClientInfo';
import { updateEndpoint as clientUpdateEndpoint } from '../../../../src/AwsClients/Pinpoint';
import {
	cacheEndpointId,
	getEndpointId,
} from '../../../../src/providers/pinpoint/utils';
import { updateEndpoint } from '../../../../src/providers/pinpoint/apis';
import {
	appId,
	category,
	clientDemographic,
	credentials,
	endpointId,
	region,
	userId,
	userProfile,
	uuid,
} from '../testUtils/data';
import { getExpectedInput } from './testUtils/getExpectedInput';

jest.mock('uuid');
jest.mock('../../../../src/awsClients/pinpoint');
jest.mock('../../../../src/providers/pinpoint/utils');
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
	const mockCacheEndpointId = cacheEndpointId as jest.Mock;
	const mockClientUpdateEndpoint = clientUpdateEndpoint as jest.Mock;
	const mockGetClientInfo = getClientInfo as jest.Mock;
	const mockGetEndpointId = getEndpointId as jest.Mock;
	const mockUuid = v4 as jest.Mock;

	beforeAll(() => {
		mockUuid.mockReturnValue(uuid);
		mockGetClientInfo.mockReturnValue(clientDemographic);
	});

	beforeEach(() => {
		mockGetEndpointId.mockReturnValue(endpointId);
	});

	afterEach(() => {
		mockCacheEndpointId.mockClear();
		mockClientUpdateEndpoint.mockClear();
		mockGetEndpointId.mockReset();
	});

	it('calls the service API with a baseline input', async () => {
		await updateEndpoint({ appId, category, credentials, region });
		expect(mockClientUpdateEndpoint).toBeCalledWith(
			{ credentials, region },
			getExpectedInput({})
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
		expect(mockClientUpdateEndpoint).toBeCalledWith(
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
			})
		);
	});

	it('merges demographics', async () => {
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
		expect(mockClientUpdateEndpoint).toBeCalledWith(
			{ credentials, region },
			getExpectedInput({
				demographic: {
					...demographic,
					make: clientDemographic.make,
					model: clientDemographic.model,
				},
			})
		);
	});

	it('creates an endpoint if one is not already cached', async () => {
		mockGetEndpointId.mockReturnValue(undefined);
		mockUuid.mockReturnValueOnce(createdEndpointId);
		await updateEndpoint({ appId, category, credentials, region });
		expect(mockClientUpdateEndpoint).toBeCalledWith(
			{ credentials, region },
			getExpectedInput({ endpointId: createdEndpointId })
		);
		expect(mockCacheEndpointId).toBeCalledWith(
			appId,
			category,
			createdEndpointId
		);
	});

	it('does not cache endpoint if previously cached', async () => {
		await updateEndpoint({ appId, category, credentials, region });
		expect(mockCacheEndpointId).not.toBeCalled();
	});
});
