// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { base64Decoder } from '../../../src/utils/convert/base64/base64Decoder';
import { getAtob } from '../../../src/utils/globalHelpers';

jest.mock('../../../src/utils/globalHelpers');

const mockGetAtob = getAtob as jest.Mock;

describe('base64Decoder (non-native)', () => {
	const mockAtob = jest.fn();

	beforeEach(() => {
		mockGetAtob.mockReset();
		mockAtob.mockReset();
		mockGetAtob.mockReturnValue(mockAtob);
	});

	it('has a convert method', () => {
		expect(base64Decoder.convert).toBeDefined();
	});

	it('invokes the getAtob function to get atob from globals', () => {
		base64Decoder.convert('test');
		expect(mockGetAtob).toHaveBeenCalled();
		expect(mockAtob).toHaveBeenCalledWith('test');
	});
});
