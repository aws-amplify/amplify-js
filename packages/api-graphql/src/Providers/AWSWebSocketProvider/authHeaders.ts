// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, ConsoleLogger } from '@aws-amplify/core';
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

const awsAuthTokenHeader = async (ctx: AmplifyContext, { host }: AWSAppSyncRealTimeAuthInput) => {
	const session = await ctx.fetchAuthSession();

	return {
		Authorization: session?.tokens?.accessToken?.toString(),
		host,
	};
};

const awsRealTimeApiKeyHeader = async (_ctx: AmplifyContext, {
	apiKey,
	host,
}: AWSAppSyncRealTimeAuthInput) => {
	const dt = new Date();
	const dtStr = dt.toISOString().replace(/[:-]|\.\d{3}/g, '');

	return {
		host,
		'x-amz-date': dtStr,
		'x-api-key': apiKey,
	};
};

const awsRealTimeIAMHeader = async (ctx: AmplifyContext, {
	payload,
	canonicalUri,
	appSyncGraphqlEndpoint,
	region,
}: AWSAppSyncRealTimeAuthInput) => {
	const endpointInfo = {
		region,
		service: 'appsync',
	};

	const creds = (await ctx.fetchAuthSession()).credentials;

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

const customAuthHeader = async (_ctx: AmplifyContext, {
	host,
	additionalCustomHeaders,
}: AWSAppSyncRealTimeAuthInput) => {
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

export const awsRealTimeHeaderBasedAuth = async (ctx: AmplifyContext, {
	apiKey,
	authenticationType,
	canonicalUri,
	appSyncGraphqlEndpoint,
	region,
	additionalCustomHeaders,
	payload,
}: AWSAppSyncRealTimeAuthInput): Promise<
	Record<string, string | undefined> | undefined
> => {
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

		const result = await handler(ctx, {
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
