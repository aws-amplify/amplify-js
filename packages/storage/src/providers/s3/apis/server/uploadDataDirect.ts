// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	ServerUploadDataOutput,
	ServerUploadDataTask,
	ServerUploadDataWithPathInput,
} from '../../types';
import { putObject } from '../../utils/client/s3data';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { STORAGE_INPUT_KEY } from '../../utils/constants';

export function uploadDataDirect(
	contextSpec: AmplifyServer.ContextSpec,
	input: ServerUploadDataWithPathInput,
): ServerUploadDataTask {
	const abortController = new AbortController();

	const result = (async (): Promise<ServerUploadDataOutput> => {
		const { amplify } = getAmplifyServerContext(contextSpec);
		const { data, options } = input;

		const { s3Config, bucket, keyPrefix, identityId } =
			await resolveS3ConfigAndInput(amplify, input as any);
		const { inputType, objectKey } = validateStorageOperationInput(
			input as any,
			identityId,
		);

		const finalKey =
			inputType === STORAGE_INPUT_KEY ? keyPrefix + objectKey : objectKey;

		const contentType =
			options?.contentType ??
			(data instanceof Blob ? data.type : undefined) ??
			'application/octet-stream';

		const body =
			data instanceof ArrayBuffer || ArrayBuffer.isView(data)
				? data
				: data instanceof Blob
					? data
					: typeof data === 'string'
						? data
						: undefined;

		if (body === undefined) {
			throw new Error(
				'Unsupported data type. Supported types: string, Blob, ArrayBuffer, ArrayBufferView.',
			);
		}

		const { ETag: eTag } = await putObject(
			{
				...s3Config,
				abortSignal: abortController.signal,
				userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
			},
			{
				Bucket: bucket,
				Key: finalKey,
				Body: body,
				ContentType: contentType,
				Metadata: options?.metadata,
			},
		);

		return {
			path: input.path,
			eTag,
			contentType,
			metadata: options?.metadata,
			size: data instanceof Blob ? data.size : undefined,
		};
	})();

	return {
		result,
		cancel: () => {
			abortController.abort();
		},
	};
}
