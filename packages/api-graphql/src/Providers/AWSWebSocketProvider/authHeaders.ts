// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	ConsoleLogger,
	getGlobalContext,
} from '@aws-amplify/core';
import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { AWS_APPSYNC_REALTIME_HEADERS } from '../constants';
import { AWSAppSyncRealTimeProviderOptions } from '../AWSAppSyncRealTimeProvider';

const logger = new ConsoleLogger('AWSAppSyncRealTimeProvider Auth');

type AWSAppSyncRealTimeAuthInput =
	Partial<AWSAppSyncRealTimeProviderOptions> & {
		canonicalUri: string;
		payload: string;
		host?: string | undefined;
	};

const awsAuthTokenHeader = async (
	resolveCtx: () => AmplifyContext,
	{ host }: AWSAppSyncRealTimeAuthInput,
) => {
	const session = await resolveCtx().fetchAuthSession();

	return {
		Authorization: session?.tokens?.accessToken?.toString(),
		host,
	};
};

const awsRealTimeApiKeyHeader = async (
	_resolveCtx: () => AmplifyContext,
	{ apiKey, host }: AWSAppSyncRealTimeAuthInput,
) => {
	const dt = new Date();
	const dtStr = dt.toISOString().replace(/[:-]|\.\d{3}/g, '');

	return {
		host,
		'x-amz-date': dtStr,
		'x-api-key': apiKey,
	};
};

const awsRealTimeIAMHeader = async (
	resolveCtx: () => AmplifyContext,
	{
		payload,
		canonicalUri,
		appSyncGraphqlEndpoint,
		region,
	}: AWSAppSyncRealTimeAuthInput,
) => {
	const endpointInfo = {
		region,
		service: 'appsync',
	};

	const creds = (await resolveCtx().fetchAuthSession()).credentials;

	const request = {
		url: `${appSyncGraphqlEndpoint}${canonicalUri}`,
		data: payload,
		method: 'POST',
		headers: { ...AWS_APPSYNC_REALTIME_HEADERS },
	};

	const signedParams = signRequest(
		{
			headers: request.headers,
			method: request.method,
			url: new AmplifyUrl(request.url),
			body: request.data,
		},
		{
			credentials: creds!,
			signingRegion: endpointInfo.region!,
			signingService: endpointInfo.service,
		},
	);

	return signedParams.headers;
};

const customAuthHeader = async (
	_resolveCtx: () => AmplifyContext,
	{ host, additionalCustomHeaders }: AWSAppSyncRealTimeAuthInput,
) => {
	/**
	 * If `additionalHeaders` was provided to the subscription as a function,
	 * the headers that are returned by that function will already have been
	 * provided before this function is called.
	 */
	if (!additionalCustomHeaders?.Authorization) {
		throw new Error('No auth token specified');
	}

	return {
		Authorization: additionalCustomHeaders.Authorization,
		host,
	};
};

export const awsRealTimeHeaderBasedAuth = async (
	authInput: AWSAppSyncRealTimeAuthInput,
	ctx?: AmplifyContext,
): Promise<Record<string, string | undefined> | undefined> => {
	const {
		apiKey,
		authenticationType,
		canonicalUri,
		appSyncGraphqlEndpoint,
		region,
		additionalCustomHeaders,
		payload,
	} = authInput;

	// Resolve context LAZILY. Only the auth handlers that actually consume the
	// context (iam / oidc / userPool) invoke this thunk. apiKey / none / lambda
	// ignore it, so they must keep working with no explicit ctx AND no global
	// context — resolving (and potentially throwing) here would break them.
	// NOTE: we also do NOT capture getGlobalContext() eagerly — it's resolved
	// fresh, per invocation of the thunk.
	const resolveCtx = (): AmplifyContext => ctx ?? getGlobalContext();

	const headerHandler = {
		apiKey: awsRealTimeApiKeyHeader,
		iam: awsRealTimeIAMHeader,
		oidc: awsAuthTokenHeader,
		userPool: awsAuthTokenHeader,
		lambda: customAuthHeader,
		none: customAuthHeader,
	} as const;

	if (!authenticationType || !headerHandler[authenticationType]) {
		logger.debug(`Authentication type ${authenticationType} not supported`);

		return undefined;
	} else {
		const handler = headerHandler[authenticationType];

		const host = appSyncGraphqlEndpoint
			? new AmplifyUrl(appSyncGraphqlEndpoint).host
			: undefined;

		const resolvedApiKey = authenticationType === 'apiKey' ? apiKey : undefined;

		logger.debug(`Authenticating with ${JSON.stringify(authenticationType)}`);

		const result = await handler(resolveCtx, {
			payload,
			canonicalUri,
			appSyncGraphqlEndpoint,
			apiKey: resolvedApiKey,
			region,
			host,
			additionalCustomHeaders,
		});

		return result;
	}
};
