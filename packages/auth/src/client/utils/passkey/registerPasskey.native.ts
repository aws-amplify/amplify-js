// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { createPasskey as rtnCreatePasskey } from '@aws-amplify/react-native';

import { PasskeyCreateOptionsJson, PasskeyCreateResultJson } from './types';

export const registerPasskey = async (input: PasskeyCreateOptionsJson) => {
	const result = await rtnCreatePasskey(JSON.stringify(input));

	return JSON.parse(result) as PasskeyCreateResultJson;
};
