// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';

import {
	buildStorageServiceError,
	deserializeBoolean,
	map,
	parseXmlError,
} from '../../../utils';
import type { DeleteObjectCommandOutput } from '../../types';

type DeleteObjectOutput = DeleteObjectCommandOutput;

export const createDeleteObjectDeserializer =
	(): ((response: HttpResponse) => Promise<DeleteObjectOutput>) =>
	async (response: HttpResponse): Promise<DeleteObjectOutput> => {
		if (response.statusCode >= 300) {
			// error is always set when statusCode >= 300
			const error = (await parseXmlError(response)) as Error;
			throw buildStorageServiceError(error, response.statusCode);
		} else {
			const content = map(response.headers, {
				DeleteMarker: ['x-amz-delete-marker', deserializeBoolean],
				VersionId: 'x-amz-version-id',
				RequestCharged: 'x-amz-request-charged',
			});

			return {
				...content,
				$metadata: parseMetadata(response),
			};
		}
	};
