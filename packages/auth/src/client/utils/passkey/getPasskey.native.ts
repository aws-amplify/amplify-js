// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyRtnPasskeys } from '@aws-amplify/react-native';

import { PasskeyGetOptionsJson, PasskeyGetResultJson } from './types';
import { handlePasskeyAuthenticationError } from './errors';

export const getPasskey = async (
	input: PasskeyGetOptionsJson,
): Promise<PasskeyGetResultJson> => {
	try {
		return await loadAmplifyRtnPasskeys().getPasskey(input);
	} catch (err: unknown) {
		throw handlePasskeyAuthenticationError(err);
	}
};
