// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	GetPropertiesInput,
	GetPropertiesInputKey,
	GetPropertiesInputPath,
	GetPropertiesOutput,
	GetPropertiesOutputKey,
	GetPropertiesOutputPath,
} from '../../types';
import { getProperties as getPropertiesInternal } from '../internal/getProperties';

interface GetProperties {
	/**
	 * Gets the properties of a file. The properties include S3 system metadata and
	 * the user metadata that was provided when uploading the file.
	 *
	 * @param contextSpec - The isolated server context.
	 * @param input - The `GetPropertiesInput` object.
	 * @returns Requested object properties.
	 * @throws An `S3Exception` when the underlying S3 service returned error.
	 * @throws A `StorageValidationErrorCode` when API call parameters are invalid.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: GetPropertiesInputPath,
	): Promise<GetPropertiesOutputPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/javascript/build-a-backend/storage/get-properties/ | path} instead.
	 *
	 * Gets the properties of a file. The properties include S3 system metadata and
	 * the user metadata that was provided when uploading the file.
	 *
	 * @param contextSpec - The isolated server context.
	 * @param input - The `GetPropertiesInput` object.
	 * @returns Requested object properties.
	 * @throws An `S3Exception` when the underlying S3 service returned error.
	 * @throws A `StorageValidationErrorCode` when API call parameters are invalid.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: GetPropertiesInputKey,
	): Promise<GetPropertiesOutputKey>;
}

export const getProperties: GetProperties = <
	Output extends GetPropertiesOutput,
>(
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesInput,
): Promise<Output> =>
	getPropertiesInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	) as Promise<Output>;
