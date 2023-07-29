// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core';

export enum StorageValidationErrorCode {
	NoCredentials = 'NoCredentials',
}

export const validationErrorMap: AmplifyErrorMap<StorageValidationErrorCode> = {
	[StorageValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty',
	},
};
