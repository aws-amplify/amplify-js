// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataAccess } from '../../../src/storageBrowser/apis/getDataAccess';
import { getDataAccess as getDataAccessClient } from '../../../src/providers/s3/utils/client/s3control';
import { GetDataAccessInput } from '../../../src/storageBrowser/apis/types';

jest.mock('../../../src/providers/s3/utils/client/s3control');

const MOCK_ACCOUNT_ID = 'accountId';
const MOCK_REGION = 'us-east-2';
const MOCK_ACCESS_ID = 'accessId';
const MOCK_SECRET_ACCESS_KEY = 'secretAccessKey';
const MOCK_SESSION_TOKEN = 'sessionToken';
const MOCK_EXPIRATION = '2013-09-17T18:07:53.000Z';
const MOCK_EXPIRATION_DATE = new Date(MOCK_EXPIRATION);
const MOCK_SCOPE = 's3://mybucket/files/*';
const MOCK_CREDENTIALS = {
	credentials: {
		accessKeyId: MOCK_ACCESS_ID,
		secretAccessKey: MOCK_SECRET_ACCESS_KEY,
		sessionToken: MOCK_SESSION_TOKEN,
		expiration: MOCK_EXPIRATION_DATE,
	},
};
const MOCK_ACCESS_CREDENTIALS = {
	AccessKeyId: MOCK_ACCESS_ID,
	SecretAccessKey: MOCK_SECRET_ACCESS_KEY,
	SessionToken: MOCK_SESSION_TOKEN,
	Expiration: MOCK_EXPIRATION_DATE,
};
const MOCK_CREDENTIAL_PROVIDER = async () => MOCK_CREDENTIALS;

const sharedGetDataAccessParams: GetDataAccessInput = {
	accountId: MOCK_ACCOUNT_ID,
	credentialsProvider: MOCK_CREDENTIAL_PROVIDER,
	durationSeconds: 900,
	permission: 'READWRITE',
	region: MOCK_REGION,
	scope: MOCK_SCOPE,
};

describe('getDataAccess', () => {
	const getDataAccessClientMock = getDataAccessClient as jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		getDataAccessClientMock.mockResolvedValue({
			Credentials: MOCK_ACCESS_CREDENTIALS,
			MatchedGrantTarget: MOCK_SCOPE,
		});
	});

	it('should invoke the getDataAccess client correctly', async () => {
		const result = await getDataAccess(sharedGetDataAccessParams);

		expect(getDataAccessClientMock).toHaveBeenCalledWith(
			expect.objectContaining({
				credentials: MOCK_CREDENTIALS.credentials,
				region: MOCK_REGION,
				userAgentValue: expect.stringContaining('storage/8'),
			}),
			expect.objectContaining({
				AccountId: MOCK_ACCOUNT_ID,
				Target: MOCK_SCOPE,
				Permission: 'READWRITE',
				TargetType: undefined,
				DurationSeconds: 900,
			}),
		);

		expect(result.credentials).toEqual(MOCK_CREDENTIALS.credentials);
		expect(result.scope).toEqual(MOCK_SCOPE);
	});

	it('should throw an error if the service does not return credentials', async () => {
		expect.assertions(1);

		getDataAccessClientMock.mockResolvedValue({
			Credentials: undefined,
			MatchedGrantTarget: MOCK_SCOPE,
		});

		expect(getDataAccess(sharedGetDataAccessParams)).rejects.toThrow(
			'Service did not return credentials.',
		);
	});

	it('should set the correct target type when accessing an object', async () => {
		const MOCK_OBJECT_SCOPE = 's3://mybucket/files/file.md';

		getDataAccessClientMock.mockResolvedValue({
			Credentials: MOCK_ACCESS_CREDENTIALS,
			MatchedGrantTarget: MOCK_OBJECT_SCOPE,
		});

		const result = await getDataAccess({
			...sharedGetDataAccessParams,
			scope: MOCK_OBJECT_SCOPE,
		});

		expect(getDataAccessClientMock).toHaveBeenCalledWith(
			expect.any(Object),
			expect.objectContaining({
				AccountId: MOCK_ACCOUNT_ID,
				Target: MOCK_OBJECT_SCOPE,
				Permission: 'READWRITE',
				TargetType: 'Object',
				DurationSeconds: 900,
			}),
		);

		expect(result.scope).toEqual(MOCK_OBJECT_SCOPE);
	});
});
