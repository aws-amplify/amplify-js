// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UploadDataInput, UploadDataWithPathInput } from '../../types';
import { createUploadTask } from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { DEFAULT_PART_SIZE, MAX_OBJECT_SIZE } from '../../utils/constants';
import { byteLength } from '../uploadData/byteLength';
import { putObjectJob } from '../uploadData/putObjectJob';
import { getMultipartUploadHandlers } from '../uploadData/multipart';

import { S3Configuration } from './types';

export function internalUploadData(
	config: S3Configuration,
	input: UploadDataInput | UploadDataWithPathInput,
) {
	const { data } = input;

	const dataByteLength = byteLength(data);
	assertValidationError(
		dataByteLength === undefined || dataByteLength <= MAX_OBJECT_SIZE,
		StorageValidationErrorCode.ObjectIsTooLarge,
	);

	if (dataByteLength && dataByteLength <= DEFAULT_PART_SIZE) {
		// Single part upload
		const abortController = new AbortController();

		return createUploadTask({
			isMultipartUpload: false,
			job: putObjectJob({
				config,
				input,
				abortSignal: abortController.signal,
				totalLength: dataByteLength,
			}),
			onCancel: (message?: string) => {
				abortController.abort(message);
			},
		});
	} else {
		// Multipart upload
		const { multipartUploadJob, onPause, onResume, onCancel } =
			getMultipartUploadHandlers({ config, input, size: dataByteLength });

		return createUploadTask({
			isMultipartUpload: true,
			job: multipartUploadJob,
			onCancel: (message?: string) => {
				onCancel(message);
			},
			onPause,
			onResume,
		});
	}
}
