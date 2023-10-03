// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum RestApiValidationErrorCode {
	NoCredentials = 'NoCredentials',
}

export const validationErrorMap: AmplifyErrorMap<RestApiValidationErrorCode> = {
	[RestApiValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty.',
	},
};
