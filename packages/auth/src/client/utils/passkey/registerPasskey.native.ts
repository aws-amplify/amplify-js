// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyRtnPasskeys } from '@aws-amplify/react-native';

import { PasskeyCreateOptionsJson, PasskeyCreateResultJson } from './types';
import {
	PasskeyErrorCode,
	assertPasskeyError,
	handlePasskeyRegistrationError,
} from './errors';
import { getIsPasskeySupported } from './getIsPasskeySupported';

export const registerPasskey = async (
	input: PasskeyCreateOptionsJson,
): Promise<PasskeyCreateResultJson> => {
	try {
		const isPasskeySupported = getIsPasskeySupported();

		assertPasskeyError(
			isPasskeySupported,
			PasskeyErrorCode.PasskeyNotSupported,
		);

		const credential = await loadAmplifyRtnPasskeys().createPasskey(input);

		// assert credential is valid

		return credential;
	} catch (err: unknown) {
		// console.log(JSON.stringify(err, null, 2));
		console.log(err.message);
		console.log(err.code);
		throw handlePasskeyRegistrationError(err);
	}
};
