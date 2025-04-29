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

import {
	assignStringVariables,
	buildStorageServiceError,
	emptyArrayGuard,
	map,
	parseXmlBody,
	s3TransferHandler,
} from '../utils';
import { createStringEnumDeserializer } from '../utils/deserializeHelpers';

import type {
	ListCallerAccessGrantsCommandInput,
	ListCallerAccessGrantsCommandOutput,
} from './types';
import { defaultConfig, parseXmlError } from './base';

export type ListCallerAccessGrantsInput = Pick<
	ListCallerAccessGrantsCommandInput,
	| 'AccountId'
	| 'AllowedByApplication'
	| 'GrantScope'
	| 'NextToken'
	| 'MaxResults'
>;

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
		allowedByApplication: input.AllowedByApplication,
	});
	const url = new AmplifyUrl(endpoint.url.toString());
	url.search = new AmplifyUrlSearchParams(query).toString();

	// Ref: https://docs.aws.amazon.com/AmazonS3/latest/API/API_control_ListCallerAccessGrants.html
	url.pathname = '/v20180820/accessgrantsinstance/caller/grants';

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
		throw buildStorageServiceError((await parseXmlError(response))!);
	} else {
		const parsed = await parseXmlBody(response);
		const contents = map(parsed, {
			CallerAccessGrantsList: [
				'CallerAccessGrantsList',
				value =>
					emptyArrayGuard(value.AccessGrant, deserializeAccessGrantsList),
			],
			NextToken: 'NextToken',
		});

		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

const deserializeAccessGrantsList = (output: any[]) =>
	output.map(deserializeCallerAccessGrant);

const deserializeCallerAccessGrant = (output: any) =>
	map(output, {
		ApplicationArn: 'ApplicationArn',
		GrantScope: 'GrantScope',
		Permission: [
			'Permission',
			createStringEnumDeserializer(
				['READ', 'READWRITE', 'WRITE'] as const,
				'Permission',
			),
		],
	});

export const listCallerAccessGrants = composeServiceApi(
	s3TransferHandler,
	listCallerAccessGrantsSerializer,
	listCallerAccessGrantsDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);
