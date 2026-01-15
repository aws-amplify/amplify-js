// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	RemoveInput,
	RemoveOperation,
	RemoveOutput,
	RemoveTaskState,
	RemoveWithPathOutput,
} from '../../types';
import {
	deleteFolderContents,
	isPathFolder,
	resolveFinalKey,
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
	validateRemovePath,
	validateStorageOperationInput,
} from '../../utils';
import { deleteObject } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
import { CanceledError } from '../../../../errors/CanceledError';
// TODO: Remove this interface when we move to public advanced APIs.
import { RemoveInput as RemoveWithPathInputWithAdvancedOptions } from '../../../../internals';

export function remove(
	amplify: AmplifyClassV6,
	input: RemoveInput,
): RemoveOperation<RemoveOutput>;
export function remove(
	amplify: AmplifyClassV6,
	input: RemoveWithPathInputWithAdvancedOptions,
): RemoveOperation<RemoveWithPathOutput>;
export function remove(
	amplify: AmplifyClassV6,
	input: RemoveInput | RemoveWithPathInputWithAdvancedOptions,
): RemoveOperation<RemoveOutput | RemoveWithPathOutput> {
	const abortController = new AbortController();
	let state: RemoveTaskState = 'IN_PROGRESS';

	const resultPromise = executeRemove(amplify, input, abortController);
	const wrappedPromise = resultPromise
		.then(result => {
			state = 'SUCCESS';

			return result;
		})
		.catch(error => {
			state = abortController.signal.aborted ? 'CANCELED' : 'ERROR';

			throw error;
		});

	const operation = {
		result: wrappedPromise,
		cancel: () => {
			abortController.abort();
			state = 'CANCELED';
		},
		get state() {
			return state;
		},
		then: wrappedPromise.then.bind(wrappedPromise),
		catch: wrappedPromise.catch.bind(wrappedPromise),
		finally: wrappedPromise.finally.bind(wrappedPromise),
	};

	return operation as RemoveOperation<RemoveOutput | RemoveWithPathOutput>;
}

async function executeRemove(
	amplify: AmplifyClassV6,
	input: RemoveInput | RemoveWithPathInputWithAdvancedOptions,
	abortController: AbortController,
) {
	try {
		const { s3Config, keyPrefix, bucket, identityId } =
			await resolveS3ConfigAndInput(amplify, input);

		const { inputType, objectKey } = validateStorageOperationInput(
			input,
			identityId,
		);

		validateBucketOwnerID(input.options?.expectedBucketOwner);

		const finalKey = resolveFinalKey(inputType, objectKey, keyPrefix);

		validateRemovePath(finalKey);

		const isFolder =
			finalKey.endsWith('/') ||
			(await isPathFolder({
				s3Config,
				bucket,
				key: finalKey,
				expectedBucketOwner: input.options?.expectedBucketOwner,
			}));

		if (isFolder) {
			return deleteFolderContents({
				s3Config,
				bucket,
				folderKey: finalKey,
				expectedBucketOwner: input.options?.expectedBucketOwner,
				onProgress: (input as any).options?.onProgress,
				abortSignal: abortController.signal,
			});
		} else {
			if (abortController.signal.aborted) {
				throw new CanceledError({ message: 'Operation was cancelled' });
			}

			await deleteObject(
				{
					...s3Config,
					userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
					abortSignal: abortController.signal,
				},
				{
					Bucket: bucket,
					Key: finalKey,
					ExpectedBucketOwner: input.options?.expectedBucketOwner,
				},
			);

			const result =
				inputType === STORAGE_INPUT_KEY
					? { key: objectKey }
					: { path: objectKey };

			return result;
		}
	} catch (error) {
		if (abortController.signal.aborted) {
			throw new CanceledError({ message: 'Operation was cancelled' });
		}

		throw error;
	}
}
