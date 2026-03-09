// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';

import {
	ServerUploadDataOutput,
	ServerUploadDataWithPathInput,
} from '../../types';

import { getUrl } from './getUrl';

export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: ServerUploadDataWithPathInput,
): Promise<ServerUploadDataOutput>;

export async function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: ServerUploadDataWithPathInput,
): Promise<ServerUploadDataOutput> {
	const { options, data, ...restInput } = input;

	const urlOptions = {
		...options,
		method: 'PUT',
	};

	// Get presigned URL
	const urlResult = await getUrl(contextSpec, {
		...restInput,
		options: urlOptions,
	} as any);

	// Perform actual upload to S3
	const uploadResponse = await fetch(urlResult.url.href, {
		method: 'PUT',
		body: data,
		headers: {
			'Content-Type':
				data instanceof File ? data.type : 'application/octet-stream',
		},
	});

	if (!uploadResponse.ok) {
		throw new Error(`Upload failed: ${uploadResponse.statusText}`);
	}

	// Return upload result
	const result: ServerUploadDataOutput = {
		path: input.path,
		eTag: uploadResponse.headers.get('ETag') || undefined,
		contentType: data instanceof File ? data.type : 'application/octet-stream',
		size: data instanceof File ? data.size : undefined,
	};

	return result;
}
