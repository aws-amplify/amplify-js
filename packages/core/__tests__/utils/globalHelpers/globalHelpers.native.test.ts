// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadGetRandomValues } from '@aws-amplify/react-native';

import {
	getAtob,
	getBtoa,
	getCrypto,
} from '../../../src/utils/globalHelpers/index.native';

jest.mock('react-native');
jest.mock('@aws-amplify/react-native', () => ({
	loadGetRandomValues: jest.fn(() => {
		Object.defineProperty(global, 'crypto', {
			value: { getRandomValues: jest.fn(() => 'mocked') },
			writable: true,
		});
	}),
	loadBase64: jest.fn(() => ({
		decode: jest.fn(() => 'isMockDecode'),
		encode: jest.fn(() => 'isMockEncode'),
	})),
}));

const mockLoadGetRandomValues = loadGetRandomValues as jest.Mock;

describe('getGlobal (native)', () => {
	beforeAll(() => {
		// mock the behavior of loading the react-native-get-random-values package
		mockLoadGetRandomValues();
	});

	describe('getCrypto()', () => {
		it('returns the polyfill crypto from react-native-get-random-values', () => {
			expect(getCrypto().getRandomValues(null)).toEqual('mocked');
		});
	});

	describe('getBtoa()', () => {
		it('returns encode provided by base-64', () => {
			expect(getBtoa()('input')).toEqual('isMockEncode');
		});
	});

	describe('getAtob()', () => {
		it('returns decode provided by base-64', () => {
			expect(getAtob()('input')).toEqual('isMockDecode');
		});
	});
});
