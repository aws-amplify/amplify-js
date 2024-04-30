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

	it('returns a new endpoint id for a category', () => {
		mockAmplifyUuid.mockReturnValue(uuid);

		expect(createEndpointId(appId, category)).toBe(uuid);
	});

	it('returns the same endpoint id for a category', () => {
		const newUuid = `new-${uuid}`;
		mockAmplifyUuid.mockReturnValue(newUuid);

		expect(createEndpointId(appId, category)).toBe(uuid);
	});

	it('returns a new endpoint id for a different category', () => {
		const newUuid = `new-${uuid}`;
		const newCategory = 'PushNotification';
		mockAmplifyUuid.mockReturnValue(newUuid);

		expect(createEndpointId(appId, newCategory)).toBe(newUuid);
	});

	it('clears a created endpoint id for a category', () => {
		const newUuid = `new-${uuid}`;
		mockAmplifyUuid.mockReturnValue(newUuid);
		clearCreatedEndpointId(appId, category);

		expect(createEndpointId(appId, category)).toBe(newUuid);
	});
});
