// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { uploadData as internalUploadData } from '../internal/uploadData';
import {
	UploadDataInput,
	UploadDataOutput,
	UploadDataWithPathInput,
	UploadDataWithPathOutput,
} from '../../types';

export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataWithPathInput,
): UploadDataWithPathOutput;

export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataInput,
): UploadDataOutput;

export function uploadData(
	contextSpec: AmplifyServer.ContextSpec,
	input: UploadDataInput | UploadDataWithPathInput,
) {
	return internalUploadData(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	);
}
