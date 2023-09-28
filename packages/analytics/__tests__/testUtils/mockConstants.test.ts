// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const mockBufferConfig = {
	bufferSize: 10,
	flushSize: 5,
	flushInterval: 50,
};

export const mockConfig = {
	...mockBufferConfig,
	region: 'us-east-1',
};

export const mockCredentialConfig = {
	credentials: {
		accessKeyId: 'accessKeyId0',
		secretAccessKey: 'secretAccessKey0',
		sessionToken: 'sessionToken0',
	},
	identityId: 'identity0',
};
