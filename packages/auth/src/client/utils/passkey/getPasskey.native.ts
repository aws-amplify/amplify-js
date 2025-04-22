// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyRtnPasskeys } from '@aws-amplify/react-native';

import { PasskeyGetOptionsJson, PasskeyGetResultJson } from './types';
import {
	PasskeyErrorCode,
	assertPasskeyError,
	handlePasskeyAuthenticationError,
} from './errors';
import { getIsPasskeySupported } from './getIsPasskeySupported';

export const getPasskey = async (
	input: PasskeyGetOptionsJson,
): Promise<PasskeyGetResultJson> => {
	try {
		const isPasskeySupported = getIsPasskeySupported();

		assertPasskeyError(
			isPasskeySupported,
			PasskeyErrorCode.PasskeyNotSupported,
		);

		const credential = await loadAmplifyRtnPasskeys().getPasskey(input);

		return credential;
	} catch (err: unknown) {
		throw handlePasskeyAuthenticationError(err);
	}
};
