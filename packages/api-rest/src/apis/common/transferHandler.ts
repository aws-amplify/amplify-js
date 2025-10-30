// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	Headers,
	HttpRequest,
	RetryOptions,
	getRetryDecider,
	jitteredBackoff,
} from '@aws-amplify/core/internals/aws-client-utils';
import {
	AWSCredentials,
	DocumentType,
	RESTAuthMode,
	RetryStrategy,
} from '@aws-amplify/core/internals/utils';

import {
	logger,
	parseRestApiServiceError,
	parseSigningInfo,
	resolveLibraryOptions,
} from '../../utils';
import { resolveHeaders } from '../../utils/resolveHeaders';
import { RestApiResponse, SigningServiceInfo } from '../../types';

import { authenticatedHandler } from './baseHandlers/authenticatedHandler';
import { unauthenticatedHandler } from './baseHandlers/unauthenticatedHandler';

type HandlerOptions = Omit<HttpRequest, 'body' | 'headers'> & {
	body?: DocumentType | FormData;
	headers?: Headers;
	withCredentials?: boolean;
	retryStrategy?: RetryStrategy;
	defaultAuthMode?: RESTAuthMode;
};

type RetryDecider = RetryOptions['retryDecider'];

/**
 * Make REST API call with best-effort IAM auth.
 * @param amplify Amplify instance to to resolve credentials and tokens. Should use different instance in client-side
 *   and SSR
 * @param options Options accepted from public API options when calling the handlers.
 * @param signingServiceInfo Internal-only options enable IAM auth as well as to to overwrite the IAM signing service
 *   and region. If specified, and NONE of API Key header or Auth header is present, IAM auth will be used.
 * @param iamAuthApplicable Callback function that is used to determine if IAM Auth should be used or not.
 *
 * @internal
 */
export const transferHandler = async (
	amplify: AmplifyClassV6,
	options: HandlerOptions & { abortSignal: AbortSignal },
	iamAuthApplicable: (
		{ headers }: HttpRequest,
		signingServiceInfo?: SigningServiceInfo,
	) => boolean,
	signingServiceInfo?: SigningServiceInfo,
): Promise<RestApiResponse> => {
	const {
		url,
		method,
		headers,
		body,
		withCredentials,
		abortSignal,
		retryStrategy,
	} = options;
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
	const {
		retryStrategy: libraryRetryStrategy,
		defaultAuthMode: libraryDefaultAuthMode,
	} = resolveLibraryOptions(amplify);
	const baseOptions = {
		retryDecider: getRetryDeciderFromStrategy(
			retryStrategy ?? libraryRetryStrategy,
		),
		computeDelay: jitteredBackoff,
		withCrossDomainCredentials: withCredentials,
		abortSignal,
	};

	const defaultAuthMode = options.defaultAuthMode ?? libraryDefaultAuthMode;

	let credentials: AWSCredentials | null = null;
	if (defaultAuthMode !== 'none') {
		credentials = await resolveCredentials(amplify);
	}

	let response: RestApiResponse;
	const isIamAuthApplicable = iamAuthApplicable(request, signingServiceInfo);

	if (isIamAuthApplicable && credentials) {
		const signingInfoFromUrl = parseSigningInfo(url);
		const signingService =
			signingServiceInfo?.service ?? signingInfoFromUrl.service;
		const signingRegion =
			signingServiceInfo?.region ?? signingInfoFromUrl.region;
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

const getRetryDeciderFromStrategy = (
	retryStrategy: RetryStrategy | undefined,
): RetryDecider => {
	const strategy = retryStrategy?.strategy;
	if (strategy === 'no-retry') {
		return () => Promise.resolve({ retryable: false });
	}

	return getRetryDecider(parseRestApiServiceError);
};

const resolveCredentials = async (
	amplify: AmplifyClassV6,
): Promise<AWSCredentials | null> => {
	try {
		const { credentials } = await amplify.Auth.fetchAuthSession();
		if (credentials) {
			return credentials;
		}
	} catch (e) {
		logger.debug('No credentials available, the request will be unsigned.');
	}

	return null;
};
