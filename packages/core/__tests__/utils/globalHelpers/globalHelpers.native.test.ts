// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decode, encode } from 'base-64';
import { omit } from 'lodash';
import { AmplifyError } from '../../../src/errors';
import {
	getAtob,
	getBtoa,
	getCrypto,
} from '../../../src/utils/globalHelpers/index.native';

// react-native-get-random-values package doesn't export anything but writes
// global.crypto
jest.mock('react-native-get-random-values', () => {});
jest.mock('base-64');

const mockDecode = decode as jest.Mock;
const mockEncode = encode as jest.Mock;

describe('getGlobal (native)', () => {
	const mockCrypto = {
		getRandomValues: jest.fn(),
	};

	beforeAll(() => {
		// mock the behavior of the react-native-get-random-values package
		Object.defineProperty(global, 'crypto', {
			value: mockCrypto,
			writable: true,
		});
	});

	describe('getCrypto()', () => {
		it('returns the polyfill crypto from react-native-get-random-values', () => {
			expect(getCrypto()).toEqual(mockCrypto);
		});
	});

	describe('getBtoa()', () => {
		it('returns encode provided by base-64', () => {
			expect(getBtoa()).toEqual(mockEncode);
		});
	});

	describe('getAtob()', () => {
		it('returns decode provided by base-64', () => {
			expect(getAtob()).toEqual(mockDecode);
		});
	});
});
