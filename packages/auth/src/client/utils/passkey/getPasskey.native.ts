// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { getPasskey as rtnGetPasskey } from '@aws-amplify/react-native';

import { PasskeyGetOptionsJson, PasskeyGetResultJson } from './types';

export const getPasskey = async (input: PasskeyGetOptionsJson) => {
	const result = await rtnGetPasskey(JSON.stringify(input));

	return JSON.parse(result) as PasskeyGetResultJson;
};
