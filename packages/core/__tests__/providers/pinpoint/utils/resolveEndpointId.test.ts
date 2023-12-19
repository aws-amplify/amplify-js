// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateEndpoint } from '../../../../src/providers/pinpoint/apis/updateEndpoint';
import {
	getEndpointId,
	resolveEndpointId,
} from '../../../../src/providers/pinpoint/utils';
import {
	appId,
	category,
	credentials,
	endpointId,
	identityId,
	region,
} from '../testUtils/data';

jest.mock('../../../../src/providers/pinpoint/apis/updateEndpoint');
jest.mock('../../../../src/providers/pinpoint/utils/getEndpointId');

describe('Pinpoint Provider Util: resolveEndpointId', () => {
	// assert mocks
	const mockGetEndpointId = getEndpointId as jest.Mock;
	const mockUpdateEndpoint = updateEndpoint as jest.Mock;

	beforeEach(() => {
		mockGetEndpointId.mockResolvedValue(endpointId);
	});

	afterEach(() => {
		mockUpdateEndpoint.mockClear();
		mockGetEndpointId.mockReset();
	});

	it('returns a cached endpoint id', async () => {
		expect(
			await resolveEndpointId({
				appId,
				category,
				credentials,
				identityId,
				region,
			})
		).toBe(endpointId);
	});

	it('prepares an endpoint if one is not already cached', async () => {
		mockGetEndpointId.mockResolvedValueOnce(undefined);
		expect(
			await resolveEndpointId({
				appId,
				category,
				credentials,
				identityId,
				region,
			})
		).toBe(endpointId);

		expect(mockUpdateEndpoint).toHaveBeenCalledWith({
			appId,
			category,
			credentials,
			identityId,
			region,
		});
	});

	it('throws an error if endpoint is unable to be created', async () => {
		mockGetEndpointId.mockResolvedValue(undefined);
		await expect(
			resolveEndpointId({
				appId,
				category,
				credentials,
				identityId,
				region,
			})
		).rejects.toThrow('Endpoint ID');
	});
});
