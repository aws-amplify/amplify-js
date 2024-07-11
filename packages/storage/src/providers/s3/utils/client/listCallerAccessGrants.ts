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
	ListCallerAccessGrantsCommandInput,
	ListCallerAccessGrantsCommandOutput,
} from './typesAccessGrants';
import { defaultConfig } from './base';
import {
	assignStringVariables,
	buildStorageServiceError,
	emptyArrayGuard,
	map,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
} from './utils';

export type ListCallerAccessGrantsInput = ListCallerAccessGrantsCommandInput;

export type ListCallerAccessGrantsOutput = ListCallerAccessGrantsCommandOutput;

const listCallerAccessGrantsSerializer = (
	input: ListCallerAccessGrantsInput,
	endpoint: Endpoint,
): HttpRequest => {
	const headers = assignStringVariables({
		'x-amz-account-id': input.AccountId,
	});
	const query = assignStringVariables({
		grantscope: input.GrantScope,
		maxResults: input.MaxResults,
		nextToken: input.NextToken,
	});
	const url = new AmplifyUrl(endpoint.url.toString());
	url.search = new AmplifyUrlSearchParams(query).toString();

	return {
		method: 'GET',
		headers,
		url,
	};
};

const listCallerAccessGrantsDeserializer = async (
	response: HttpResponse,
): Promise<ListCallerAccessGrantsOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	} else {
		const parsed = await parseXmlBody(response);
		const contents = map(parsed, {
			CallerAccessGrantsList: [
				'CallerAccessGrantsList',
				value => emptyArrayGuard(value, deserializeCallerAccessGrantsList),
			],
			NextToken: 'NextToken',
		});

		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

const deserializeCallerAccessGrantsList = (output: any[]) =>
	output.map(deserializeCallerAccessGrant);

const deserializeCallerAccessGrant = (output: any) =>
	map(output, {
		ApplicationArn: 'ApplicationArn',
		GrantScope: 'GrantScope',
		Permission: 'Permission',
	});

export const listCallerAccessGrants = composeServiceApi(
	s3TransferHandler,
	listCallerAccessGrantsSerializer,
	listCallerAccessGrantsDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);
