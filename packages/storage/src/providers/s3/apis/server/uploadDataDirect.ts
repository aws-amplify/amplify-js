// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	ServerUploadDataOutput,
	ServerUploadDataTask,
	ServerUploadDataWithPathInput,
} from '../../types';
import { uploadData as uploadDataInternal } from '../internal/uploadData';
import { byteLength } from '../internal/uploadData/byteLength';
import { DEFAULT_PART_SIZE } from '../../utils/constants';

export function uploadDataDirect(
	contextSpec: AmplifyServer.ContextSpec,
	input: ServerUploadDataWithPathInput,
): ServerUploadDataTask {
	const amplify = getAmplifyServerContext(contextSpec).amplify;
	const size = byteLength(input.data);
	const isMultipart = size !== undefined && size > DEFAULT_PART_SIZE;

	console.log(`[uploadDataDirect v4] ${isMultipart ? 'MULTIPART' : 'SINGLE'} upload for: ${input.path} (${size} bytes)`);

	const task = uploadDataInternal(amplify, input as any);

	return {
		result: task.result.then(res => ({
			path: input.path,
			eTag: res.eTag,
			contentType: res.contentType,
			metadata: res.metadata,
			size: undefined,
		})),
		cancel: () => task.cancel(),
	};
}
