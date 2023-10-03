// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadGetRandomValues } from '@aws-amplify/react-native';
import { decode, encode } from 'base-64';
import {
	getAtob,
	getBtoa,
	getCrypto,
} from '../../../src/utils/globalHelpers/index.native';

const mockCrypto = {
	getRandomValues: jest.fn(),
};

jest.mock('react-native');
jest.mock('@aws-amplify/react-native', () => ({
	loadGetRandomValues: jest.fn(() => {
		Object.defineProperty(global, 'crypto', {
			value: mockCrypto,
			writable: true,
		});
	}),
}));
jest.mock('base-64');

const mockDecode = decode as jest.Mock;
const mockEncode = encode as jest.Mock;
const mockLoadGetRandomValues = loadGetRandomValues as jest.Mock;

describe('getGlobal (native)', () => {
	beforeAll(() => {
		// mock the behavior of loading the react-native-get-random-values package
		mockLoadGetRandomValues();
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
