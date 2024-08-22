// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpResponse,
	parseJsonBody,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import { assertServiceError } from '../../../../../../errors/utils/assertServiceError';
import { AuthError } from '../../../../../../errors/AuthError';

export const createUserPoolDeserializer =
	<Output>(): ((response: HttpResponse) => Promise<Output>) =>
	async (response: HttpResponse): Promise<Output> => {
		if (response.statusCode >= 300) {
			const error = await parseJsonError(response);
			assertServiceError(error);
			throw new AuthError({ name: error.name, message: error.message });
		}

		return parseJsonBody(response);
	};
