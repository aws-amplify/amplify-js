// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataAccess } from '../../../../../../../src/providers/s3/utils/client/s3control';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';

const MOCK_ACCOUNT_ID = 'accountId';
const MOCK_ACCESS_ID = 'accessId';
const MOCK_SECRET_ACCESS_KEY = 'secretAccessKey';
const MOCK_SESSION_TOKEN = 'sessionToken';
const MOCK_EXPIRATION = '2013-09-17T18:07:53.000Z';
const MOCK_EXPIRATION_DATE = new Date(MOCK_EXPIRATION);
const MOCK_GRANT_TARGET = 'matchedGrantTarget';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_control_GetDataAccess.html
const getDataAccessHappyCase: ApiFunctionalTestCase<typeof getDataAccess> = [
	'happy case',
	'getDataAccess',
	getDataAccess,
	defaultConfig,
	{
		AccountId: MOCK_ACCOUNT_ID,
		Target: 's3://my-bucket/path/to/object.md',
		TargetType: 'Object',
		DurationSeconds: 100,
		Permission: 'READWRITE',
		Privilege: 'Default',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://accountid.s3-control.us-east-1.amazonaws.com/v20180820/accessgrantsinstance/dataaccess?durationSeconds=100&permission=READWRITE&privilege=Default&target=s3%3A%2F%2Fmy-bucket%2Fpath%2Fto%2Fobject.md&targetType=Object',
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
		<GetDataAccessResult>
			<Credentials>
				<AccessKeyId>${MOCK_ACCESS_ID}</AccessKeyId>
				<SecretAccessKey>${MOCK_SECRET_ACCESS_KEY}</SecretAccessKey>
				<SessionToken>${MOCK_SESSION_TOKEN}</SessionToken>
				<Expiration>${MOCK_EXPIRATION}</Expiration>
			</Credentials>
			<MatchedGrantTarget>${MOCK_GRANT_TARGET}</MatchedGrantTarget>
		</GetDataAccessResult>
	`,
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		Credentials: {
			AccessKeyId: MOCK_ACCESS_ID,
			SecretAccessKey: MOCK_SECRET_ACCESS_KEY,
			SessionToken: MOCK_SESSION_TOKEN,
			Expiration: MOCK_EXPIRATION_DATE,
		},
		MatchedGrantTarget: MOCK_GRANT_TARGET,
	},
];

const getDataAccessHappyCaseCustomEndpoint: ApiFunctionalTestCase<
	typeof getDataAccess
> = [
	'happy case',
	'getDataAccess with custom endpoint',
	getDataAccess,
	{
		...defaultConfig,
		customEndpoint: 'custom.endpoint.com',
	},
	{
		AccountId: MOCK_ACCOUNT_ID,
		Target: 's3://my-bucket/path/to/object.md',
		Permission: 'READWRITE',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://accountid.custom.endpoint.com/v20180820/accessgrantsinstance/dataaccess?permission=READWRITE&target=s3%3A%2F%2Fmy-bucket%2Fpath%2Fto%2Fobject.md',
		}),
	}),
	{
		status: 200,
		headers: {
			...DEFAULT_RESPONSE_HEADERS,
		},
		body: '',
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];

const getDataAccessErrorCase: ApiFunctionalTestCase<typeof getDataAccess> = [
	'error case',
	'getDataAccess',
	getDataAccess,
	defaultConfig,
	getDataAccessHappyCase[4],
	getDataAccessHappyCase[5],
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

const getDataAccessErrorCaseInvalidCustomEndpoint: ApiFunctionalTestCase<
	typeof getDataAccess
> = [
	'error case',
	'getDataAccess with invalid custom endpoint',
	getDataAccess,
	{
		...defaultConfig,
		customEndpoint: 'http://custom.endpoint.com',
	},
	{
		AccountId: MOCK_ACCOUNT_ID,
		Target: 's3://my-bucket/path/to/object.md',
		Permission: 'READWRITE',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://accountid.custom.endpoint.com/v20180820/accessgrantsinstance/dataaccess?permission=READWRITE&target=s3%3A%2F%2Fmy-bucket%2Fpath%2Fto%2Fobject.md',
		}),
	}),
	{
		status: 200,
		headers: {
			...DEFAULT_RESPONSE_HEADERS,
		},
		body: '',
	},
	{
		message: 'Invalid S3 custom endpoint.',
		name: 'InvalidCustomEndpoint',
	},
];

export default [
	getDataAccessHappyCase,
	getDataAccessHappyCaseCustomEndpoint,
	getDataAccessErrorCase,
	getDataAccessErrorCaseInvalidCustomEndpoint,
];
