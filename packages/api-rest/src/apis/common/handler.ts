// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	HttpRequest,
	unauthenticatedHandler,
	Headers,
	getRetryDecider,
	jitteredBackoff,
	authenticatedHandler,
} from '@aws-amplify/core/internals/aws-client-utils';
import { DocumentType } from '@aws-amplify/core/internals/utils';

import {
	parseRestApiServiceError,
	parseSigningInfo,
	resolveCredentials,
} from '../../utils';
import { resolveHeaders } from '../../utils/resolveHeaders';
import { RestApiResponse } from '../../types';

type HandlerOptions = Omit<HttpRequest, 'body' | 'headers'> & {
	body?: DocumentType | FormData;
	headers?: Headers;
	withCredentials?: boolean;
};

type SigningServiceInfo = {
	service?: string;
	region?: string;
};

/**
 * Make REST API call with best-effort IAM auth.
 * @param amplify Amplify instance to to resolve credentials and tokens. Should use different instance in client-side
 *   and SSR
 * @param options Options accepted from public API options when calling the handlers.
 * @param signingServiceInfo Internal-only options enable IAM auth as well as to to overwrite the IAM signing service
 *   and region. If specified, and NONE of API Key header or Auth header is present, IAM auth will be used.
 *
 * @internal
 */
export const transferHandler = async (
	amplify: AmplifyClassV6,
	options: HandlerOptions & { abortSignal: AbortSignal },
	signingServiceInfo?: SigningServiceInfo
): Promise<RestApiResponse> => {
	const { url, method, headers, body, withCredentials, abortSignal } = options;
	const resolvedBody = body
		? body instanceof FormData
			? body
			: JSON.stringify(body ?? '')
		: undefined;
	const resolvedHeaders: Headers = resolveHeaders(headers, body);
	const request = {
		url,
		headers: resolvedHeaders,
		method,
		body: resolvedBody,
	};
	const baseOptions = {
		retryDecider: getRetryDecider(parseRestApiServiceError),
		computeDelay: jitteredBackoff,
		withCrossDomainCredentials: withCredentials,
		abortSignal,
	};

	const isIamAuthApplicable = iamAuthApplicable(request, signingServiceInfo);
	let response: RestApiResponse;
	if (isIamAuthApplicable) {
		const signingInfoFromUrl = parseSigningInfo(url);
		const signingService =
			signingServiceInfo?.service ?? signingInfoFromUrl.service;
		const signingRegion =
			signingServiceInfo?.region ?? signingInfoFromUrl.region;
		const credentials = await resolveCredentials(amplify);
		response = await authenticatedHandler(request, {
			...baseOptions,
			credentials,
			region: signingRegion,
			service: signingService,
		});
	} else {
		response = await unauthenticatedHandler(request, {
			...baseOptions,
		});
	}
	// Clean-up un-modeled properties from response.
	return {
		statusCode: response.statusCode,
		headers: response.headers,
		body: response.body,
	};
};

const iamAuthApplicable = (
	{ headers }: HttpRequest,
	signingServiceInfo?: SigningServiceInfo
) => !headers.authorization && !headers['x-api-key'] && !!signingServiceInfo;
