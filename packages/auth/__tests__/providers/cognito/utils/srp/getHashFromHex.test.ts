// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Sha256 } from '@aws-crypto/sha256-js';
import { getHashFromHex } from '../../../../../src/providers/cognito/utils/srp/getHashFromHex';

describe('getHashFromHex', () => {
	it('produces a valid hex string with regex', () => {
		const regEx = /[0-9a-f]/g;
		const awsCryptoHash = new Sha256();
		awsCryptoHash.update('testString');
		const resultFromAWSCrypto = awsCryptoHash.digestSync();
		const hashHex = Buffer.from(resultFromAWSCrypto).toString('hex');

		expect(regEx.test(getHashFromHex(hashHex))).toBe(true);
	});
});
