// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { listCallerAccessGrants } from '../../../../../../../src/providers/s3/utils/client/s3control';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';

const MOCK_ACCOUNT_ID = 'accountId';
const MOCK_NEXT_TOKEN = 'nextToken';
const MOCK_APP_ARN = 'appArn';
const MOCK_GRANT_SCOPE = 's3://my-bucket/path/to/object.md';
const MOCK_PERMISSION = 'READWRITE';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_control_ListAccessGrants.html
const listCallerAccessGrantsHappyCaseSingleGrant: ApiFunctionalTestCase<
	typeof listCallerAccessGrants
> = [
	'happy case',
	'listCallerAccessGrantsHappyCaseSingleGrant',
	listCallerAccessGrants,
	defaultConfig,
	{
		AccountId: MOCK_ACCOUNT_ID,
		GrantScope: 's3://my-bucket/path/to/',
		MaxResults: 50,
		NextToken: 'mockToken',
		AllowedByApplication: true,
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://accountid.s3-control.us-east-1.amazonaws.com/v20180820/accessgrantsinstance/caller/grants?grantscope=s3%3A%2F%2Fmy-bucket%2Fpath%2Fto%2F&maxResults=50&nextToken=mockToken&allowedByApplication=true',
		}),
		method: 'GET',
		headers: expect.objectContaining({
			'x-amz-account-id': MOCK_ACCOUNT_ID,
		}),
	}),
	{
		status: 200,
		headers: {
			...DEFAULT_RESPONSE_HEADERS,
		},
		body: `
		<?xml version="1.0" encoding="UTF-8"?>
		<ListCallerAccessGrantsResult>
			<NextToken>${MOCK_NEXT_TOKEN}</NextToken>
			<CallerAccessGrantsList>
				<AccessGrant>
						<ApplicationArn>${MOCK_APP_ARN}</ApplicationArn>
						<GrantScope>${MOCK_GRANT_SCOPE}</GrantScope>
						<Permission>${MOCK_PERMISSION}</Permission>
				</AccessGrant>
			</CallerAccessGrantsList>
		</ListCallerAccessGrantsResult>
	`,
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		CallerAccessGrantsList: [
			{
				ApplicationArn: MOCK_APP_ARN,
				GrantScope: MOCK_GRANT_SCOPE,
				Permission: MOCK_PERMISSION,
			},
		],
		NextToken: MOCK_NEXT_TOKEN,
	},
];

const listCallerAccessGrantsHappyCaseMultipleGrants: ApiFunctionalTestCase<
	typeof listCallerAccessGrants
> = [
	'happy case',
	'listCallerAccessGrantsHappyCaseMultipleGrants',
	listCallerAccessGrants,
	defaultConfig,
	{
		AccountId: MOCK_ACCOUNT_ID,
		GrantScope: 's3://my-bucket/path/to/',
		MaxResults: 50,
		NextToken: 'mockToken',
		AllowedByApplication: true,
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://accountid.s3-control.us-east-1.amazonaws.com/v20180820/accessgrantsinstance/caller/grants?grantscope=s3%3A%2F%2Fmy-bucket%2Fpath%2Fto%2F&maxResults=50&nextToken=mockToken&allowedByApplication=true',
		}),
		method: 'GET',
		headers: expect.objectContaining({
			'x-amz-account-id': MOCK_ACCOUNT_ID,
		}),
	}),
	{
		status: 200,
		headers: {
			...DEFAULT_RESPONSE_HEADERS,
		},
		body: `
		<?xml version="1.0" encoding="UTF-8"?>
		<ListCallerAccessGrantsResult>
			<NextToken>${MOCK_NEXT_TOKEN}</NextToken>
			<CallerAccessGrantsList>
				<AccessGrant>
						<ApplicationArn>${MOCK_APP_ARN}</ApplicationArn>
						<GrantScope>${MOCK_GRANT_SCOPE}</GrantScope>
						<Permission>${MOCK_PERMISSION}</Permission>
				</AccessGrant>
				<AccessGrant>
						<ApplicationArn>${MOCK_APP_ARN}</ApplicationArn>
						<GrantScope>${MOCK_GRANT_SCOPE}</GrantScope>
						<Permission>${MOCK_PERMISSION}</Permission>
				</AccessGrant>
			</CallerAccessGrantsList>
		</ListCallerAccessGrantsResult>
	`,
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		CallerAccessGrantsList: [
			{
				ApplicationArn: MOCK_APP_ARN,
				GrantScope: MOCK_GRANT_SCOPE,
				Permission: MOCK_PERMISSION,
			},
			{
				ApplicationArn: MOCK_APP_ARN,
				GrantScope: MOCK_GRANT_SCOPE,
				Permission: MOCK_PERMISSION,
			},
		],
		NextToken: MOCK_NEXT_TOKEN,
	},
];

const listCallerAccessGrantsErrorCase: ApiFunctionalTestCase<
	typeof listCallerAccessGrants
> = [
	'error case',
	'listCallerAccessGrants',
	listCallerAccessGrants,
	defaultConfig,
	listCallerAccessGrantsHappyCaseSingleGrant[4],
	listCallerAccessGrantsHappyCaseSingleGrant[5],
	{
		status: 403,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `
		<?xml version="1.0" encoding="UTF-8"?>
		<ErrorResponse>
			<Error>
				<Code>AccessDenied</Code>
				<Message>Access Denied</Message>
			</Error>
			<RequestId>656c76696e6727732072657175657374</RequestId>
			<HostId>Uuag1LuByRx9e6j5Onimru9pO4ZVKnJ2Qz7/C1NPcfTWAtRPfTaOFg==</HostId>
		</ErrorResponse>
		`,
	},
	{
		message: 'Access Denied',
		name: 'AccessDenied',
	},
];

export default [
	listCallerAccessGrantsHappyCaseSingleGrant,
	listCallerAccessGrantsHappyCaseMultipleGrants,
	listCallerAccessGrantsErrorCase,
];
