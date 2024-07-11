// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataAccess } from '../../../../../../../src/providers/s3/utils/client';
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

// API Reference: NA
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
			href: 'https://s3.us-east-1.amazonaws.com/?durationSeconds=100&permission=READWRITE&privilege=Default&target=s3%3A%2F%2Fmy-bucket%2Fpath%2Fto%2Fobject.md&targetType=Object"',
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

export default [getDataAccessHappyCase];
