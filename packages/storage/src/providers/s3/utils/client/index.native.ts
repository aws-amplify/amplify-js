// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import '@aws-amplify/core/polyfills/URL'; // TODO: [v6] install react-native-url-polyfill separately

export { SERVICE_NAME } from './base';
export {
	getObject,
	GetObjectInput,
	GetObjectOutput,
	getPresignedGetObjectUrl,
} from './getObject';
export {
	listObjectsV2,
	ListObjectsV2Input,
	ListObjectsV2Output,
} from './listObjectsV2';
export { putObject, PutObjectInput, PutObjectOutput } from './putObject';
export {
	createMultipartUpload,
	CreateMultipartUploadInput,
	CreateMultipartUploadOutput,
} from './createMultipartUpload';
export { uploadPart, UploadPartInput, UploadPartOutput } from './uploadPart';
export {
	completeMultipartUpload,
	CompleteMultipartUploadInput,
	CompleteMultipartUploadOutput,
} from './completeMultipartUpload';
export { listParts, ListPartsInput, ListPartsOutput } from './listParts';
export {
	abortMultipartUpload,
	AbortMultipartUploadInput,
	AbortMultipartUploadOutput,
} from './abortMultipartUpload';
export { copyObject, CopyObjectInput, CopyObjectOutput } from './copyObject';
export { headObject, HeadObjectInput, HeadObjectOutput } from './headObject';
export {
	deleteObject,
	DeleteObjectInput,
	DeleteObjectOutput,
} from './deleteObject';
export { CompletedPart, Part, _Object } from './types';
