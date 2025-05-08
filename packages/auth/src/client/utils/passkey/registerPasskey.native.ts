// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyRtnPasskeys } from '@aws-amplify/react-native';

import { PasskeyCreateOptionsJson, PasskeyCreateResultJson } from './types';
import { handlePasskeyRegistrationError } from './errors';

export const registerPasskey = async (
	input: PasskeyCreateOptionsJson,
): Promise<PasskeyCreateResultJson> => {
	try {
		return await loadAmplifyRtnPasskeys().createPasskey(input);
	} catch (err: unknown) {
		throw handlePasskeyRegistrationError(err);
	}
};
