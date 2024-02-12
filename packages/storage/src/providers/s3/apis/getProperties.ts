// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { GetPropertiesInput, GetPropertiesOutput, S3Exception } from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { getProperties as getPropertiesInternal } from './internal/getProperties';

/**
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param input - The GetPropertiesInput object.
 * @returns Requested object properties.
 * @throws A {@link S3Exception} when the underlying S3 service returned error.
 * @throws A {@link StorageValidationErrorCode} when API call parameters are invalid.
 */
export const getProperties = (
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput> => {
	return getPropertiesInternal(Amplify, input);
};
