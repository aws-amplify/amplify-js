// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAssertionFunction } from '~/src/errors';
import { AmplifyErrorMap, AssertionFunction } from '~/src/types';

export enum PinpointValidationErrorCode {
	NoAppId = 'NoAppId',
}

const pinpointValidationErrorMap: AmplifyErrorMap<PinpointValidationErrorCode> =
	{
		[PinpointValidationErrorCode.NoAppId]: {
			message: 'Missing application id.',
		},
	};

export const assert: AssertionFunction<PinpointValidationErrorCode> =
	createAssertionFunction(pinpointValidationErrorMap);
