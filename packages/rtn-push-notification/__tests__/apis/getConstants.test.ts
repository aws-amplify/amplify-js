// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getConstants } from '../../src/apis/getConstants';
import { nativeModule } from '../../src/nativeModule';

jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		getConstants: jest.fn(),
	},
}));

describe('getConstants', () => {
	const constants = { foo: 'bar' };
	// assert mocks
	const mockGetConstantsNative = nativeModule.getConstants as jest.Mock;

	beforeAll(() => {
		mockGetConstantsNative.mockReturnValue(constants);
	});

	afterEach(() => {
		mockGetConstantsNative.mockClear();
	});

	it('calls the native getConstants', () => {
		expect(getConstants()).toStrictEqual(constants);
		expect(mockGetConstantsNative).toBeCalled();
	});
});
