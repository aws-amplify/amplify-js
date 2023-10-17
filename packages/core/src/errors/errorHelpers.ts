// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAssertionFunction } from './createAssertionFunction';
import { AmplifyErrorCode, AmplifyErrorMap, AssertionFunction } from '../types';

const amplifyErrorMap: AmplifyErrorMap<AmplifyErrorCode> = {
	[AmplifyErrorCode.NoEndpointId]: {
		message: 'Endpoint ID was not found and was unable to be created.',
	},
	[AmplifyErrorCode.PlatformNotSupported]: {
		message: 'Function not supported on current platform.',
	},
	[AmplifyErrorCode.Unknown]: {
		message: 'An unknown error occurred.',
	},
};

export const assert: AssertionFunction<AmplifyErrorCode> =
	createAssertionFunction(amplifyErrorMap);
