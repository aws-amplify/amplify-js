// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Headers } from '@aws-amplify/core/internals/aws-client-utils';

// TODO: replace with ResponsePayloadMixin from core
type Payload = Pick<Body, 'blob' | 'json' | 'text'>;

export type StorageDownloadDataResult = {
	body: Payload;
};

export type StorageGetUrlResult = {
	url: URL;
	expiresAt: Date;
	headers?: Headers;
};

export type StorageUploadResult = {
	key: string;
};

export type StorageGetPropertiesResult = {
	contentType?: string;
};
