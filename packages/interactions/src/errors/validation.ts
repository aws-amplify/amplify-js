// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum InteractionsValidationErrorCode {
	NoBotConfig = 'NoBotConfig',
}

export const validationErrorMap: AmplifyErrorMap<InteractionsValidationErrorCode> =
	{
		[InteractionsValidationErrorCode.NoBotConfig]: {
			message: 'Missing configuration for the bot',
		},
	};
