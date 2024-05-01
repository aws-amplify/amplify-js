// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearCreatedEndpointId,
	createEndpointId,
} from '../../../../src/providers/pinpoint/utils/createEndpointId';
import { amplifyUuid } from '../../../../src/utils/amplifyUuid';
import { appId, category, uuid } from '../testUtils/data';

jest.mock('../../../../src/utils/amplifyUuid');

describe('Pinpoint Provider Util: createEndpointId', () => {
	// assert mocks
	const mockAmplifyUuid = amplifyUuid as jest.Mock;

	afterEach(() => {
		mockAmplifyUuid.mockReset();
	});

	it('returns a new endpoint id for a category', () => {
		mockAmplifyUuid.mockReturnValue(uuid);

		expect(createEndpointId(appId, category)).toBe(uuid);
		expect(mockAmplifyUuid).toHaveBeenCalled();
	});

	it('returns the same endpoint id for a category', () => {
		const newUuid = `new-${uuid}`;
		mockAmplifyUuid.mockReturnValue(newUuid);

		expect(createEndpointId(appId, category)).toBe(uuid);
		expect(mockAmplifyUuid).not.toHaveBeenCalled();
	});

	it('returns a new endpoint id for a different category', () => {
		const newUuid = `new-${uuid}`;
		const newCategory = 'PushNotification';
		mockAmplifyUuid.mockReturnValue(newUuid);

		expect(createEndpointId(appId, newCategory)).toBe(newUuid);
		expect(mockAmplifyUuid).toHaveBeenCalled();
	});

	describe('clearCreatedEndpointId()', () => {
		it('can create a new endpoint id for a category after clearing', () => {
			const newUuid = `new-${uuid}`;
			mockAmplifyUuid.mockReturnValue(newUuid);
			clearCreatedEndpointId(appId, category);

			expect(createEndpointId(appId, category)).toBe(newUuid);
		});
	});
});
