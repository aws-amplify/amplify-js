// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	UploadDataInput,
	UploadDataServerOutput,
	UploadDataServerWithPathOutput,
	UploadDataWithPathInput,
} from '../../types';
import { uploadData as uploadDataInternal } from '../internal/uploadData';

/**
 * Upload data to the specified S3 object path. By default uses a single PUT
 * operation to upload when the payload is less than 5MB. Otherwise, uses
 * multipart upload to upload the payload.
 *
 * Server-side `uploadData` is intended for use in SSR contexts such as
 * Next.js Route Handlers and Server Actions.
 *
 * @param contextSpec - The isolated server context.
 * @param input - A `UploadDataWithPathInput` object.
 *
 * @returns An `UploadDataServerWithPathOutput` task. Await the `result`
 * 	promise to get the upload result.
 *
 * @throws S3Exception when the underlying S3 service returned error.
 * @throws StorageValidationErrorCode when API call parameters are invalid.
 *
 * @example
 * ```ts
 * // In a Next.js Route Handler
 * import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs';
 * import { uploadData } from 'aws-amplify/storage/server';
 * import { cookies } from 'next/headers';
 *
 * export async function POST(request: Request) {
 *   const formData = await request.formData();
 *   const file = formData.get('file') as File;
 *   const result = await runWithAmplifyServerContext({
 *     nextServerContext: { cookies },
 *     operation: (contextSpec) =>
 *       uploadData(contextSpec, { path: `uploads/${file.name}`, data: file }).result,
 *   });
 *   return Response.json(result);
 * }
 * ```
 */
export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataWithPathInput,
): UploadDataServerWithPathOutput;

/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/javascript/build-a-backend/storage/upload/#uploaddata | path} instead.
 *
 * Upload data to the specified S3 object key. By default uses a single PUT
 * operation to upload when the payload is less than 5MB. Otherwise, uses
 * multipart upload to upload the payload.
 *
 * The returned task does NOT support `pause()` / `resume()` server-side. See
 * the path-based overload above for details.
 *
 * @param contextSpec - The isolated server context.
 * @param input - A `UploadDataInput` object.
 *
 * @returns An `UploadDataServerOutput` task. Await the `result` promise to
 * 	get the upload result.
 *
 * @throws S3Exception when the underlying S3 service returned error.
 * @throws StorageValidationErrorCode when API call parameters are invalid.
 */
export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataInput,
): UploadDataServerOutput;

export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataInput | UploadDataWithPathInput,
): UploadDataServerOutput | UploadDataServerWithPathOutput {
	// The internal uploadData returns an UploadTask which has pause/resume. On
	// the server path we intentionally hide pause/resume from the type because
	// they are not supported across isolated server requests. The runtime
	// object still exposes them as no-ops (delegated to createUploadTask).
	return uploadDataInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	) as UploadDataServerOutput | UploadDataServerWithPathOutput;
}
