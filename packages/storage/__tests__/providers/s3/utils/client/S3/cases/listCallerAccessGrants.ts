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
const MOCK_ACCESS_GRANT_ARN = 'accessGrantARN';
const MOCK_ACCESS_GRANT_ID = 'accessGrantId';
const MOCK_PREFIX = 's3://my-bucket/path/to/';
const MOCK_LOCATION_ID = 'locationId';
const MOCK_APP_ARN = 'appArn';
const MOCK_TIMESTAMP = '2013-09-17T18:07:53.000Z';
const MOCK_GRANTEE_ID = 'granteeId';
const MOCK_GRANTEE_TYPE = 'IAM';
const MOCK_GRANT_SCOPE = 's3://my-bucket/path/to/object.md';
const MOCK_PERMISSION = 'READWRITE';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_control_ListAccessGrants.html
const listCallerAccessGrantsHappyCase: ApiFunctionalTestCase<
	typeof listCallerAccessGrants
> = [
	'happy case',
	'listCallerAccessGrants',
	listCallerAccessGrants,
	defaultConfig,
	{
		AccountId: MOCK_ACCOUNT_ID,
		GrantScope: 's3://my-bucket/path/to/',
		MaxResults: 50,
		NextToken: 'mockToken',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://accountid.s3-control.us-east-1.amazonaws.com/v20180820/accessgrantsinstance/grants?grantscope=s3%3A%2F%2Fmy-bucket%2Fpath%2Fto%2F&maxResults=50&nextToken=mockToken',
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
		<ListAccessGrantsResult>
			<NextToken>${MOCK_NEXT_TOKEN}</NextToken>
			<AccessGrantsList>
				<AccessGrant>
						<AccessGrantArn>${MOCK_ACCESS_GRANT_ARN}</AccessGrantArn>
						<AccessGrantId>${MOCK_ACCESS_GRANT_ID}</AccessGrantId>
						<AccessGrantsLocationConfiguration>
							<S3SubPrefix>${MOCK_PREFIX}</S3SubPrefix>
						</AccessGrantsLocationConfiguration>
						<AccessGrantsLocationId>${MOCK_LOCATION_ID}</AccessGrantsLocationId>
						<ApplicationArn>${MOCK_APP_ARN}</ApplicationArn>
						<CreatedAt>${MOCK_TIMESTAMP}</CreatedAt>
						<Grantee>
							<GranteeIdentifier>${MOCK_GRANTEE_ID}</GranteeIdentifier>
							<GranteeType>${MOCK_GRANTEE_TYPE}</GranteeType>
						</Grantee>
						<GrantScope>${MOCK_GRANT_SCOPE}</GrantScope>
						<Permission>${MOCK_PERMISSION}</Permission>
				</AccessGrant>
			</AccessGrantsList>
		</ListAccessGrantsResult>
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

const listCallerAccessGrantsErrorCase: ApiFunctionalTestCase<
	typeof listCallerAccessGrants
> = [
	'error case',
	'listCallerAccessGrants',
	listCallerAccessGrants,
	defaultConfig,
	listCallerAccessGrantsHappyCase[4],
	listCallerAccessGrantsHappyCase[5],
	{
		status: 403,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `
		<?xml version="1.0" encoding="UTF-8"?>
		<Error>
			<Code>AccessDenied</Code>
			<Message>Access Denied</Message>
			<RequestId>656c76696e6727732072657175657374</RequestId>
			<HostId>Uuag1LuByRx9e6j5Onimru9pO4ZVKnJ2Qz7/C1NPcfTWAtRPfTaOFg==</HostId>
		</Error>
		`,
	},
	{
		message: 'Access Denied',
		name: 'AccessDenied',
	},
];

export default [
	listCallerAccessGrantsHappyCase,
	listCallerAccessGrantsErrorCase,
];
