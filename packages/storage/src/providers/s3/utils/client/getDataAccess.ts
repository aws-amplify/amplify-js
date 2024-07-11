// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import {
	AmplifyUrl,
	AmplifyUrlSearchParams,
} from '@aws-amplify/core/internals/utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import type {
	GetDataAccessCommandInput,
	GetDataAccessCommandOutput,
} from './typesAccessGrants';
import { defaultConfig } from './base';
import {
	assignStringVariables,
	buildStorageServiceError,
	deserializeTimestamp,
	map,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
} from './utils';

export type GetDataAccessInput = GetDataAccessCommandInput;

export type GetDataAccessOutput = GetDataAccessCommandOutput;

const getDataAccessSerializer = (
	input: GetDataAccessInput,
	endpoint: Endpoint,
): HttpRequest => {
	const headers = assignStringVariables({
		'x-amz-account-id': input.AccountId,
	});
	const query = assignStringVariables({
		durationSeconds: input.DurationSeconds,
		permission: input.Permission,
		privilege: input.Privilege,
		target: input.Target,
		targetType: input.TargetType,
	});
	const url = new AmplifyUrl(endpoint.url.toString());
	url.search = new AmplifyUrlSearchParams(query).toString();

	return {
		method: 'GET',
		headers,
		url,
	};
};

const getDataAccessDeserializer = async (
	response: HttpResponse,
): Promise<GetDataAccessCommandOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	} else {
		const parsed = await parseXmlBody(response);
		const contents = map(parsed, {
			Credentials: ['Credentials', deserializeCredentials],
			MatchedGrantTarget: 'MatchedGrantTarget',
		});

		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

const deserializeCredentials = (output: any) =>
	map(output, {
		AccessKeyId: 'AccessKeyId',
		Expiration: ['Expiration', deserializeTimestamp],
		SecretAccessKey: 'SecretAccessKey',
		SessionToken: 'SessionToken',
	});

export const getDataAccess = composeServiceApi(
	s3TransferHandler,
	getDataAccessSerializer,
	getDataAccessDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);
