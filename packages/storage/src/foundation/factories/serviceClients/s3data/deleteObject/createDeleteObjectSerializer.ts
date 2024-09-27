// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
} from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import {
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../../shared/serdeUtils';
import type { DeleteObjectCommandInput } from '../types';

type DeleteObjectInput = Pick<DeleteObjectCommandInput, 'Bucket' | 'Key'>;

export const createDeleteObjectSerializer =
	(): ((input: DeleteObjectInput, endpoint: Endpoint) => HttpRequest) =>
	(input: DeleteObjectInput, endpoint: Endpoint): HttpRequest => {
		const url = new AmplifyUrl(endpoint.url.toString());
		validateS3RequiredParameter(!!input.Key, 'Key');
		url.pathname = serializePathnameObjectKey(url, input.Key);

		return {
			method: 'DELETE',
			headers: {},
			url,
		};
	};
