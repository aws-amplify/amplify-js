// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	CopyInput,
	CopyInputWithKey,
	CopyInputWithPath,
	CopyOutput,
	CopyOutputWithKey,
	CopyOutputWithPath,
} from '../../types';
import { copy as copyInternal } from '../internal/copy';

interface Copy {
	/**
	 * Copy an object from a source to a destination object within the same bucket.
	 *
	 * @param contextSpec - The isolated server context.
	 * @param input - The CopyInputWithPath object.
	 * @returns Output containing the destination object path.
	 * @throws service: `S3Exception` - Thrown when checking for existence of the object
	 * @throws validation: `StorageValidationErrorCode` - Thrown when
	 * source or destination path is not defined.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: CopyInputWithPath,
	): Promise<CopyOutputWithPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/copy | path} instead.
	 *
	 * Copy an object from a source to a destination object within the same bucket. Can optionally copy files across
	 * different accessLevel or identityId (if source object's accessLevel is 'protected').
	 *
	 * @param contextSpec - The isolated server context.
	 * @param input - The CopyInputWithKey object.
	 * @returns Output containing the destination object key.
	 * @throws service: `S3Exception` - Thrown when checking for existence of the object
	 * @throws validation: `StorageValidationErrorCode` - Thrown when
	 * source or destination key is not defined.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: CopyInputWithKey,
	): Promise<CopyOutputWithKey>;
}

export const copy: Copy = <Output extends CopyOutput>(
	contextSpec: AmplifyServer.ContextSpec,
	input: CopyInput,
): Promise<Output> =>
	copyInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	) as Promise<Output>;
