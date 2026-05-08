// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from '@aws-amplify/core/internals/utils';
import { AmplifyContext } from '@aws-amplify/core';
import {
	// cancel as cancelREST,
	post,
	// updateRequestToBeCancellable,
} from '@aws-amplify/api-rest/internals';

export async function graphqlRequest(
	amplify: AmplifyContext,
	url: string,
	options: any,
	abortController: AbortController,
	_post?: typeof post,
) {
	const p = _post ?? post;

	const { body: responseBody } = await p(amplify as any, {
		url: new AmplifyUrl(url),
		options,
		abortController,
	});

	const response = await responseBody.json();

	return response;
}
