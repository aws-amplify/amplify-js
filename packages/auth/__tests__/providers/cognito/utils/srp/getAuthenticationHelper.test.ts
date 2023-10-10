// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthenticationHelper } from '../../../../../src/providers/cognito/utils/srp/AuthenticationHelper';
import { getAuthenticationHelper } from '../../../../../src/providers/cognito/utils/srp/getAuthenticationHelper';
import { calculateA } from '../../../../../src/providers/cognito/utils/srp/calculate';

jest.mock('../../../../../src/providers/cognito/utils/srp/calculate');

describe('getAuthenticationHelper', () => {
	let helper: AuthenticationHelper;
	// create mocks
	const mockCalculateA = calculateA as jest.Mock;

	beforeEach(async () => {
		helper = await getAuthenticationHelper('TestPoolName');
	});

	afterEach(() => {
		mockCalculateA.mockReset();
	});

	it('returns an instance of AuthenticationHelper', () => {
		expect(helper).toBeDefined();
		expect(helper).toBeInstanceOf(AuthenticationHelper);
	});

	it('should generate with non-deterministic seeding', async () => {
		const arr: string[] = [];
		for (let i = 0; i < 20; i++) {
			const helper = await getAuthenticationHelper('TestPoolName');
			arr.push(helper.a.toString(16));
		}
		expect(arr.length).toBe(new Set(arr).size);
	});

	it('should throw an error', async () => {
		mockCalculateA.mockRejectedValue(new Error());
		await expect(getAuthenticationHelper('TestPoolName')).rejects.toThrow();
	});
});
