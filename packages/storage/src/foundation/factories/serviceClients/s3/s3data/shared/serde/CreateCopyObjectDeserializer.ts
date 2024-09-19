// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';

import { buildStorageServiceError } from '../../../deserializeHelpers';
import { parseXmlBody, parseXmlError } from '../../../parsePayload';
import type { CopyObjectCommandOutput } from '../../types';

type CopyObjectOutput = CopyObjectCommandOutput;

export const createCopyObjectDeserializer =
	(): ((response: HttpResponse) => Promise<CopyObjectOutput>) =>
	async (response: HttpResponse): Promise<CopyObjectOutput> => {
		if (response.statusCode >= 300) {
			const error = (await parseXmlError(response)) as Error;
			throw buildStorageServiceError(error, response.statusCode);
		} else {
			await parseXmlBody(response);

			return {
				$metadata: parseMetadata(response),
			};
		}
	};
