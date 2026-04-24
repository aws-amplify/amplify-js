// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { createUploadTask } from '../../../utils';
import { assertValidationError } from '../../../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../../../errors/types/validation';
import { DEFAULT_PART_SIZE, MAX_OBJECT_SIZE } from '../../../utils/constants';

import { byteLength } from './byteLength';
import { SinglePartUploadDataInput, putObjectJob } from './putObjectJob';
import {
	MultipartUploadDataInput,
	getMultipartUploadHandlers,
} from './multipart';

export const uploadData = (
	amplify: AmplifyClassV6,
	input: SinglePartUploadDataInput | MultipartUploadDataInput,
) => {
	const { data } = input;

	const dataByteLength = byteLength(data);
	assertValidationError(
		dataByteLength !== undefined,
		StorageValidationErrorCode.InvalidUploadSource,
	);
	assertValidationError(
		dataByteLength <= MAX_OBJECT_SIZE,
		StorageValidationErrorCode.ObjectIsTooLarge,
	);

	if (dataByteLength <= DEFAULT_PART_SIZE) {
		// Single part upload
		const abortController = new AbortController();

		return createUploadTask({
			isMultipartUpload: false,
			job: putObjectJob(input, abortController.signal, dataByteLength, amplify),
			onCancel: (message?: string) => {
				abortController.abort(message);
			},
		});
	} else {
		// Multipart upload
		const { multipartUploadJob, onPause, onResume, onCancel } =
			getMultipartUploadHandlers(input, dataByteLength, amplify);

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
};
