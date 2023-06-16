// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import listObjectsV2Cases from './listObjectsV2';
import putObjectCases from './putObject';
import createMultipartUploadCases from './createMultipartUpload';
import uploadPartCases from './uploadPart';
import completeMultipartUploadCases from './completeMultipartUpload';
import abortMultipartUploadCases from './abortMultipartUpload';
import listPartsCases from './listParts';

export default [
	...listObjectsV2Cases,
	...putObjectCases,
	...createMultipartUploadCases,
	...uploadPartCases,
	...completeMultipartUploadCases,
	...abortMultipartUploadCases,
	...listPartsCases,
];
