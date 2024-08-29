// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	UploadDataInput,
	UploadDataOutput,
	UploadDataWithPathInput,
	UploadDataWithPathOutput,
} from '../types';

import { uploadData as internalUploadData } from './internal/uploadData';

export function uploadData(
	input: UploadDataWithPathInput,
): UploadDataWithPathOutput;

export function uploadData(input: UploadDataInput): UploadDataOutput;

export function uploadData(input: UploadDataInput | UploadDataWithPathInput) {
	return internalUploadData(Amplify, input);
}
