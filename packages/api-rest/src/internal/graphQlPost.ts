// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { Operation, RestApiOptionsBase, RestApiResponse } from '../types';
import { transferHandler } from './handler';

const cancelTokenMap = new WeakMap<
	Promise<RestApiResponse>,
	(cancelMessage?: string) => void
>();

export type GraphQlPostInput = {
	url: URL;
	options?: RestApiOptionsBase & {
		signingServiceInfo?: {
			service: string;
			region: string;
		};
	};
};

export const post = async (
	amplify: AmplifyClassV6,
	{ url, options }: GraphQlPostInput
): Promise<RestApiResponse> => {
	const { response, cancel } = transferHandler(
		amplify,
		{
			url,
			method: 'POST',
			...options,
		},
		{
			defaultAuthMode: {
				type: 'iam',
				region: options.signingServiceInfo?.region,
				service: options.signingServiceInfo?.service,
			},
		}
	);
	cancelTokenMap.set(response, cancel);
	return response;
};

export const cancel = (
	cancelToken: Promise<RestApiResponse>,
	message?: string
) => {
	const cancel = cancelTokenMap.get(cancelToken);
	// TODO: do we need to throw here?
	cancel?.(message);
};
