// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	CopyInput,
	CopyOutput,
	CopyWithPathInput,
	CopyWithPathOutput,
} from '../../types';
import { copy as copyInternal } from '../internal/copy';

/**
 * Copy an object from a source to a destination object within the same bucket.
 *
 * @param contextSpec - The isolated server context.
 * @param input - The `CopyWithPathInput` object.
 * @returns Output containing the destination object path.
 * @throws service: `S3Exception` - Thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Thrown when
 * source or destination path is not defined.
 */
export function copy(
	contextSpec: AmplifyServer.ContextSpec,
	input: CopyWithPathInput,
): Promise<CopyWithPathOutput>;
/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/copy | path} instead.
 *
 * Copy an object from a source to a destination object within the same bucket. Can optionally copy files across
 * different accessLevel or identityId (if source object's accessLevel is 'protected').
 *
 * @param contextSpec - The isolated server context.
 * @param input - The `CopyInput` object.
 * @returns Output containing the destination object key.
 * @throws service: `S3Exception` - Thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Thrown when
 * source or destination key is not defined.
 */
export function copy(
	contextSpec: AmplifyServer.ContextSpec,
	input: CopyInput,
): Promise<CopyOutput>;

export function copy(
	contextSpec: AmplifyServer.ContextSpec,
	input: CopyInput | CopyWithPathInput,
) {
	return copyInternal(getAmplifyServerContext(contextSpec).amplify, input);
}
