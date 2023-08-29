// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import {
	Amplify,
	fetchAuthSession,
	StorageAccessLevel,
} from '@aws-amplify/core';
import { copyObject } from '../../../src/providers/s3/utils/client';
import { copy } from '../../../src/providers/s3/apis';

jest.mock('../../../src/providers/s3/utils/client');
jest.mock('@aws-amplify/core', () => ({
	fetchAuthSession: jest.fn(),
	Amplify: {
		getConfig: jest.fn(),
	},
}));
const mockCopyObject = copyObject as jest.Mock;
const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

const sourceKey = 'sourceKey';
const destinationKey = 'destinationKey';
const bucket = 'bucket';
const region = 'region';
const targetIdentityId = 'targetIdentityId';
const copyResult = { key: destinationKey };
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const copyObjectClientConfig = {
	credentials,
	region,
};
const copyObjectClientBaseParams = {
	Bucket: bucket,
	MetadataDirective: 'COPY',
};

/**
 * bucket is appended at start if it's a sourceKey
 * guest: public/${targetIdentityId}/${key}`
 * private: private/${targetIdentityId}/${key}`
 * protected: protected/${targetIdentityId}/${key}`
 */
const buildClientRequestKey = (
	key: string,
	KeyType: 'source' | 'destination',
	accessLevel: StorageAccessLevel
) => {
	const finalAccessLevel = accessLevel == 'guest' ? 'public' : accessLevel;
	let finalKey = KeyType == 'source' ? `${bucket}/` : '';
	finalKey += `${finalAccessLevel}/`;
	finalKey += finalAccessLevel != 'public' ? `${targetIdentityId}/` : '';
	finalKey += `${key}`;
	return finalKey;
};

const interAccessLevelTest = async (
	sourceAccessLevel,
	destinationAccessLevel
) => {
	expect.assertions(3);
	const source = {
		key: sourceKey,
		accessLevel: sourceAccessLevel,
	};
	sourceAccessLevel == 'protected'
		? (source['targetIdentityId'] = targetIdentityId)
		: null;

	expect(
		await copy({
			source,
			destination: {
				key: destinationKey,
				accessLevel: destinationAccessLevel,
			},
		})
	).toEqual(copyResult);
	expect(copyObject).toBeCalledTimes(1);
	expect(copyObject).toHaveBeenCalledWith(copyObjectClientConfig, {
		...copyObjectClientBaseParams,
		CopySource: buildClientRequestKey(sourceKey, 'source', sourceAccessLevel),
		Key: buildClientRequestKey(
			destinationKey,
			'destination',
			destinationAccessLevel
		),
	});
};

describe('copy API', () => {
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
			mockCopyObject.mockImplementation(() => {
				return {
					Metadata: { key: 'value' },
				};
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('Copy from guest to all access levels', () => {
			it('Should copy guest -> guest', async () =>
				await interAccessLevelTest('guest', 'guest'));
			it('Should copy guest -> private', async () =>
				await interAccessLevelTest('guest', 'private'));
			it('Should copy guest -> protected', async () =>
				await interAccessLevelTest('guest', 'protected'));
		});

		describe('Copy from private to all access levels', () => {
			it('Should copy private -> guest', async () =>
				await interAccessLevelTest('private', 'guest'));
			it('Should copy private -> private', async () =>
				await interAccessLevelTest('private', 'private'));
			it('Should copy private -> protected', async () =>
				await interAccessLevelTest('private', 'protected'));
		});

		describe('Copy from protected to all access levels', () => {
			it('Should copy protected -> guest', async () =>
				await interAccessLevelTest('protected', 'guest'));
			it('Should copy protected -> private', async () =>
				await interAccessLevelTest('protected', 'private'));
			it('Should copy protected -> protected', async () =>
				await interAccessLevelTest('protected', 'protected'));
		});
	});

	describe('Error Path Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('Should return a not found error', async () => {
			mockCopyObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				})
			);
			expect.assertions(3);
			const sourceKey = 'SourceKeyNotFound';
			const destinationKey = 'destinationKey';
			try {
				await copy({
					source: { key: sourceKey },
					destination: { key: destinationKey },
				});
			} catch (error) {
				expect(copyObject).toBeCalledTimes(1);
				expect(copyObject).toHaveBeenCalledWith(copyObjectClientConfig, {
					...copyObjectClientBaseParams,
					CopySource: `${bucket}/public/${sourceKey}`,
					Key: `public/${destinationKey}`,
				});
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
