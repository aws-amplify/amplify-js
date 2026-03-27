// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

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
	ctx: AmplifyContext,
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
		const abortController = new AbortController();

		return createUploadTask({
			isMultipartUpload: false,
			job: putObjectJob(ctx, input, abortController.signal, dataByteLength),
			onCancel: (message?: string) => {
				abortController.abort(message);
			},
		});
	} else {
		const { multipartUploadJob, onPause, onResume, onCancel } =
			getMultipartUploadHandlers(ctx, input, dataByteLength);

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
