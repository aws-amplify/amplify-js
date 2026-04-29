// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	UploadDataInput,
	UploadDataOutput,
	UploadDataWithPathInput,
	UploadDataWithPathOutput,
} from '../../types';
import { uploadData as uploadDataInternal } from '../internal/uploadData';

/**
 * Upload data to the specified S3 object path. By default uses single PUT operation to upload if the payload is less than 5MB.
 * Otherwise, uses multipart upload to upload the payload.
 *
 * Server-side uploadData is intended for use in SSR contexts (e.g. Next.js Route Handlers, Server Actions,
 * Nuxt.js server routes). Unlike the client-side counterpart, it does NOT support pause/resume of
 * multipart uploads (pause/resume relies on client-side persistent storage).
 *
 * Limitations:
 * * Maximum object size is 5TB.
 * * Maximum object size if the size cannot be determined before upload is 50GB.
 *
 * @param contextSpec - The isolated server context.
 * @param input - A `UploadDataWithPathInput` object.
 *
 * @returns A cancelable task exposing the result promise from the `result` property.
 *
 * @throws Service: `S3Exception` thrown when checking for existence of the object.
 * @throws Validation: `StorageValidationErrorCode` thrown when a validation error occurs.
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
): UploadDataWithPathOutput;

/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/javascript/build-a-backend/storage/upload/#uploaddata | path} instead.
 *
 * Upload data to the specified S3 object key. By default uses single PUT operation to upload if the payload is less than 5MB.
 * Otherwise, uses multipart upload to upload the payload.
 *
 * @param contextSpec - The isolated server context.
 * @param input - A `UploadDataInput` object.
 *
 * @returns A cancelable task exposing the result promise from the `result` property.
 *
 * @throws Service: `S3Exception` thrown when checking for existence of the object.
 * @throws Validation: `StorageValidationErrorCode` thrown when a validation error occurs.
 */
export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataInput,
): UploadDataOutput;

export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataInput | UploadDataWithPathInput,
) {
	return uploadDataInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	);
}
