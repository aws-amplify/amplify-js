// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
} from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import {
	assignStringVariables,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../../../serializeHelpers';
import type { CopyObjectCommandInput } from '../../types';

type CopyObjectInput = Pick<
	CopyObjectCommandInput,
	| 'Bucket'
	| 'CopySource'
	| 'Key'
	| 'MetadataDirective'
	| 'CacheControl'
	| 'ContentType'
	| 'ContentDisposition'
	| 'ContentLanguage'
	| 'Expires'
	| 'ACL'
	| 'Tagging'
	| 'Metadata'
>;

export const createCopyObjectSerializer =
	(): ((input: CopyObjectInput, endpoint: Endpoint) => Promise<HttpRequest>) =>
	async (input: CopyObjectInput, endpoint: Endpoint): Promise<HttpRequest> => {
		const headers = {
			...(await serializeObjectConfigsToHeaders(input)),
			...assignStringVariables({
				'x-amz-copy-source': input.CopySource,
				'x-amz-metadata-directive': input.MetadataDirective,
			}),
		};
		const url = new AmplifyUrl(endpoint.url.toString());
		validateS3RequiredParameter(!!input.Key, 'Key');
		url.pathname = serializePathnameObjectKey(url, input.Key);

		return {
			method: 'PUT',
			headers,
			url,
		};
	};
