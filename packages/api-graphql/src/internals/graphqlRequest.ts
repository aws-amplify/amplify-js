// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from '@aws-amplify/core/internals/utils';
import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	// cancel as cancelREST,
	post,
	// updateRequestToBeCancellable,
} from '@aws-amplify/api-rest/internals';

export async function graphqlRequest(
	amplify: AmplifyClassV6,
	url: string,
	options: any,
	abortController: AbortController,
	_post?: typeof post,
) {
	const p = _post ?? post;

	const { body: responseBody } = await p(amplify, {
		url: new AmplifyUrl(url),
		options,
		abortController,
	});

	const response = await responseBody.json();

	return response;
}
