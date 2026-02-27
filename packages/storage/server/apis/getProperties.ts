/* eslint-disable import/no-relative-packages */
/* eslint-disable import/no-extraneous-dependencies */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';

import {
	GetPropertiesInput,
	GetPropertiesOutput,
	GetPropertiesWithPathInput,
	GetPropertiesWithPathOutput,
} from '../../src';
import { getProperties as getPropertiesFlow } from '../flows/getProperties';

/**
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param contextSpec - The isolated server context.
 * @param input - The `GetPropertiesWithPathInput` object.
 * @returns Requested object properties
 * @throws service: `S3Exception` - thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors
 */
export function getProperties(
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesWithPathInput,
): Promise<GetPropertiesWithPathOutput>;
/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/javascript/build-a-backend/storage/download/#file-metadata | path} instead.
 *
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param contextSpec - The isolated server context.
 * @param input - The `GetPropertiesInput` object.
 * @returns Requested object properties
 * @throws service: `S3Exception` - thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors
 */
export function getProperties(
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput>;

export async function getProperties(
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesInput | GetPropertiesWithPathInput,
) {
	return getPropertiesFlow(contextSpec, input);
}
