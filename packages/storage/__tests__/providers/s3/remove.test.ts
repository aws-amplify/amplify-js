// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { deleteObject } from '../../../src/AwsClients/S3';
import { remove } from '../../../src/providers/s3/apis';

jest.mock('../../../src/AwsClients/S3');
jest.mock('@aws-amplify/core', () => {
	return {
		fetchAuthSession: jest.fn(),
		Amplify: {
			getConfig: jest.fn(),
		},
	};
});

const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;
const mockDeleteObject = deleteObject as jest.Mock;
const key = 'key';
const bucket = 'bucket';
const region = 'region';
const targetIdentityId = 'targetIdentityId';
const removeResult = { key };
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const deleteObjectClientConfig = {
	credentials,
	region,
};

describe('remove API', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: targetIdentityId,
		});
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket: 'bucket',
					region: 'region',
				},
			},
		});
	});

	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			mockDeleteObject.mockImplementation(() => {
				return {
					Metadata: { key: 'value' },
				};
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Should remove object with default accessLevel', async () => {
			expect.assertions(3);
			expect(await remove({ key })).toEqual(removeResult);
			expect(deleteObject).toBeCalledTimes(1);
			expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
				Bucket: bucket,
				Key: `public/${key}`,
			});
		});

		it('Should remove object with guest accessLevel', async () => {
			expect.assertions(3);
			expect(await remove({ key, options: { accessLevel: 'guest' } })).toEqual(
				removeResult
			);
			expect(deleteObject).toBeCalledTimes(1);
			expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
				Bucket: bucket,
				Key: `public/${key}`,
			});
		});

		it('Should remove object with private accessLevel', async () => {
			expect.assertions(3);
			const accessLevel = 'private';
			expect(await remove({ key, options: { accessLevel } })).toEqual(
				removeResult
			);
			expect(deleteObject).toBeCalledTimes(1);
			expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
				Bucket: bucket,
				Key: `${accessLevel}/${targetIdentityId}/${key}`,
			});
		});

		it('Should remove object with protected accessLevel', async () => {
			expect.assertions(3);
			const accessLevel = 'protected';
			expect(
				await remove({ key, options: { accessLevel, targetIdentityId } })
			).toEqual(removeResult);
			expect(deleteObject).toBeCalledTimes(1);
			expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
				Bucket: bucket,
				Key: `${accessLevel}/${targetIdentityId}/${key}`,
			});
		});
	});

	describe('Error Path Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('Should return a not found error', async () => {
			mockDeleteObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				})
			);
			expect.assertions(3);
			const key = 'wrongKey';
			try {
				await remove({ key });
			} catch (error) {
				expect(deleteObject).toBeCalledTimes(1);
				expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
					Bucket: bucket,
					Key: `public/${key}`,
				});
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
