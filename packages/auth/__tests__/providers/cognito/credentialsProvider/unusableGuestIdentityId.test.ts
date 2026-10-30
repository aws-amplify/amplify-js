// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	KeyValueStorageInterface,
	ResourcesConfig,
	createGetCredentialsForIdentityClient,
	createGetIdClient,
} from '@aws-amplify/core';

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
} from '../../../../src/providers/cognito';
import { AuthError } from '../../../../src/errors/AuthError';
import { authAPITestParams } from '../testUtils/authApiTestParams';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	createGetCredentialsForIdentityClient: jest.fn(),
	createGetIdClient: jest.fn(),
}));

const identityPoolId = 'us-east-1:test-id';
const identityIdKey = `com.amplify.Cognito.${identityPoolId}.identityId`;
const storedIdentityId = 'us-east-1:00000000-0000-0000-0000-000000000001';
const newIdentityId = 'us-east-1:00000000-0000-0000-0000-000000000002';

const authConfig: ResourcesConfig['Auth'] = {
	Cognito: {
		userPoolId: 'us-east-1_test-id',
		identityPoolId,
		userPoolClientId: 'test-id',
		allowGuestAccess: true,
	},
};

const serviceError = (name: string, message: string) =>
	Object.assign(new Error(message), { name, $metadata: {} });

const resourceNotFound = () =>
	serviceError(
		'ResourceNotFoundException',
		`Identity '${storedIdentityId}' not found.`,
	);
const accessForbidden = () =>
	serviceError(
		'NotAuthorizedException',
		`Access to Identity '${storedIdentityId}' is forbidden.`,
	);
const malformedIdentityId = () =>
	serviceError(
		'ValidationException',
		"1 validation error detected: Value 'not-an-identity-id' at 'identityId' failed to satisfy constraint: Member must satisfy regular expression pattern: [\\w-]+:[0-9a-f-]+",
	);

/**
 * Browser-like storage: reads see earlier writes.
 */
const createBrowserStorage = (initial: Record<string, string>) => {
	const items = new Map(Object.entries(initial));
	const storage: KeyValueStorageInterface = {
		setItem: jest.fn(async (key: string, value: string) => {
			items.set(key, value);
		}),
		getItem: jest.fn(async (key: string) => items.get(key) ?? null),
		removeItem: jest.fn(async (key: string) => {
			items.delete(key);
		}),
		clear: jest.fn(async () => {
			items.clear();
		}),
	};

	return { storage, items };
};

/**
 * Server-like storage, like the cookie storage on the server: reads come from
 * the request's cookies, and writes are only recorded for the response.
 */
const createServerStorage = (requestCookies: Record<string, string>) => {
	const responseCookies: string[] = [];
	const storage: KeyValueStorageInterface = {
		setItem: jest.fn(async (key: string, value: string) => {
			responseCookies.push(`${key}=${value}`);
		}),
		getItem: jest.fn(async (key: string) => requestCookies[key] ?? null),
		removeItem: jest.fn(async (key: string) => {
			responseCookies.push(`${key}=`);
		}),
		clear: jest.fn(),
	};

	return { storage, responseCookies };
};

const mockCreateGetCredentialsForIdentityClient = jest.mocked(
	createGetCredentialsForIdentityClient,
);
const mockCreateGetIdClient = jest.mocked(createGetIdClient);
const mockGetCredentialsForIdentity = jest.fn();
const mockGetId = jest.fn();

const credentialsFor = (identityId: string) => ({
	...authAPITestParams.CredentialsForIdentityIdResult,
	IdentityId: identityId,
});

const createProvider = (storage: KeyValueStorageInterface) =>
	new CognitoAWSCredentialsAndIdentityIdProvider(
		new DefaultIdentityIdStore(storage),
	);

const fetchGuestCredentials = (
	provider: CognitoAWSCredentialsAndIdentityIdProvider,
) =>
	provider.getCredentialsAndIdentityId({
		authenticated: false,
		authConfig: authConfig!,
	});

describe('guest credentials with an unusable stored identityId', () => {
	beforeAll(() => {
		mockCreateGetCredentialsForIdentityClient.mockReturnValue(
			mockGetCredentialsForIdentity,
		);
		mockCreateGetIdClient.mockReturnValue(mockGetId);
	});

	beforeEach(() => {
		mockGetCredentialsForIdentity.mockReset();
		mockGetId.mockReset();
		mockGetId.mockResolvedValue({ IdentityId: newIdentityId });
		mockGetCredentialsForIdentity.mockImplementation(
			async (_config, { IdentityId }) => {
				if (IdentityId === storedIdentityId) {
					throw resourceNotFound();
				}

				return credentialsFor(IdentityId);
			},
		);
	});

	describe.each([
		['ResourceNotFoundException (deleted identity)', resourceNotFound],
		['NotAuthorizedException (identity linked to a login)', accessForbidden],
		['ValidationException (malformed identityId)', malformedIdentityId],
	])('when the stored identityId fails with %s', (_, createError) => {
		beforeEach(() => {
			mockGetCredentialsForIdentity.mockImplementation(
				async (_config, { IdentityId }) => {
					if (IdentityId === storedIdentityId) {
						throw createError();
					}

					return credentialsFor(IdentityId);
				},
			);
		});

		it('gets a new guest identityId once, stores it and returns guest credentials', async () => {
			const { storage, items } = createBrowserStorage({
				[identityIdKey]: storedIdentityId,
			});
			const provider = createProvider(storage);

			const result = await fetchGuestCredentials(provider);

			expect(result?.identityId).toBe(newIdentityId);
			expect(result?.credentials.accessKeyId).toBe(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials
					.AccessKeyId,
			);
			expect(mockGetId).toHaveBeenCalledTimes(1);
			expect(mockGetId).toHaveBeenCalledWith(
				{ region: 'us-east-1' },
				{ IdentityPoolId: identityPoolId, Logins: {} },
			);
			expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(2);
			expect(mockGetCredentialsForIdentity).toHaveBeenNthCalledWith(
				1,
				{ region: 'us-east-1' },
				{ IdentityId: storedIdentityId },
			);
			expect(mockGetCredentialsForIdentity).toHaveBeenNthCalledWith(
				2,
				{ region: 'us-east-1' },
				{ IdentityId: newIdentityId },
			);
			expect(items.get(identityIdKey)).toBe(newIdentityId);
		});

		it('does not fail again on the next call', async () => {
			const { storage } = createBrowserStorage({
				[identityIdKey]: storedIdentityId,
			});

			await fetchGuestCredentials(createProvider(storage));
			// a new provider so that the in-memory credentials are not reused
			const result = await fetchGuestCredentials(createProvider(storage));

			expect(result?.identityId).toBe(newIdentityId);
			expect(mockGetId).toHaveBeenCalledTimes(1);
		});
	});

	it('gets a new identityId from GetId on the server, where reads still return the request cookie', async () => {
		const { storage, responseCookies } = createServerStorage({
			[identityIdKey]: storedIdentityId,
		});

		const result = await fetchGuestCredentials(createProvider(storage));

		expect(result?.identityId).toBe(newIdentityId);
		expect(mockGetId).toHaveBeenCalledTimes(1);
		expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(2);
		// the response replaces the unusable cookie with the new identityId
		expect(responseCookies[responseCookies.length - 1]).toBe(
			`${identityIdKey}=${newIdentityId}`,
		);
	});

	describe('concurrent calls', () => {
		// Holds each GetCredentialsForIdentity call for the stored identityId so
		// the test decides when it fails.
		const heldFailures: (() => void)[] = [];
		const waitForHeldFailures = async (count: number) => {
			while (heldFailures.length < count) {
				await new Promise(resolve => setTimeout(resolve, 0));
			}
		};

		beforeEach(() => {
			heldFailures.length = 0;
			mockGetCredentialsForIdentity.mockImplementation(
				async (_config, { IdentityId }) => {
					if (IdentityId === storedIdentityId) {
						await new Promise<void>(resolve => heldFailures.push(resolve));
						throw resourceNotFound();
					}

					return credentialsFor(IdentityId);
				},
			);
		});

		it('gets one new identityId when the calls fail at the same time', async () => {
			const { storage, items } = createBrowserStorage({
				[identityIdKey]: storedIdentityId,
			});
			const provider = createProvider(storage);

			const first = fetchGuestCredentials(provider);
			const second = fetchGuestCredentials(provider);
			await waitForHeldFailures(2);
			heldFailures.forEach(fail => {
				fail();
			});
			const results = await Promise.all([first, second]);

			expect(results.map(result => result?.identityId)).toEqual([
				newIdentityId,
				newIdentityId,
			]);
			expect(mockGetId).toHaveBeenCalledTimes(1);
			expect(items.get(identityIdKey)).toBe(newIdentityId);
		});

		it('reuses the new identityId when a call fails after another call has recovered', async () => {
			const { storage, items } = createBrowserStorage({
				[identityIdKey]: storedIdentityId,
			});
			const provider = createProvider(storage);

			const first = fetchGuestCredentials(provider);
			const second = fetchGuestCredentials(provider);
			await waitForHeldFailures(2);
			heldFailures[0]();
			const firstResult = await first;
			heldFailures[1]();
			const secondResult = await second;

			expect(firstResult?.identityId).toBe(newIdentityId);
			expect(secondResult?.identityId).toBe(newIdentityId);
			expect(mockGetId).toHaveBeenCalledTimes(1);
			expect(items.get(identityIdKey)).toBe(newIdentityId);
		});
	});

	it('throws the retry error and does not retry again when the new identityId also fails', async () => {
		mockGetCredentialsForIdentity.mockImplementation(async () => {
			throw resourceNotFound();
		});
		const { storage } = createBrowserStorage({
			[identityIdKey]: storedIdentityId,
		});

		await expect(
			fetchGuestCredentials(createProvider(storage)),
		).rejects.toMatchObject({ name: 'ResourceNotFoundException' });
		expect(mockGetId).toHaveBeenCalledTimes(1);
		expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(2);
	});

	it('throws the GetId error when a new guest identityId cannot be created', async () => {
		mockGetId.mockRejectedValue(
			serviceError(
				'NotAuthorizedException',
				'Unauthenticated access is not supported for this identity pool.',
			),
		);
		const { storage, items } = createBrowserStorage({
			[identityIdKey]: storedIdentityId,
		});

		await expect(
			fetchGuestCredentials(createProvider(storage)),
		).rejects.toMatchObject({
			name: 'NotAuthorizedException',
			message:
				'Unauthenticated access is not supported for this identity pool.',
		});
		expect(mockGetId).toHaveBeenCalledTimes(1);
		expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
		// the unusable identityId is not kept
		expect(items.has(identityIdKey)).toBe(false);
	});

	describe.each([
		[
			'NotAuthorizedException (guest access disabled on the identity pool)',
			() =>
				serviceError(
					'NotAuthorizedException',
					'Unauthenticated access is not supported for this identity pool.',
				),
		],
		[
			'InvalidIdentityPoolConfigurationException',
			() =>
				serviceError(
					'InvalidIdentityPoolConfigurationException',
					'Invalid identity pool configuration. Check assigned IAM roles for this pool.',
				),
		],
		[
			'TooManyRequestsException',
			() => serviceError('TooManyRequestsException', 'Rate exceeded'),
		],
		[
			'InternalErrorException',
			() => serviceError('InternalErrorException', 'Internal error'),
		],
		[
			'ValidationException not about the identityId',
			() =>
				serviceError(
					'ValidationException',
					"1 validation error detected: Value 'x' at 'customRoleArn' failed to satisfy constraint",
				),
		],
		['a network error', () => new TypeError('Failed to fetch')],
	])('when the stored identityId fails with %s', (_, createError) => {
		it('throws without getting a new identityId and keeps the stored identityId', async () => {
			mockGetCredentialsForIdentity.mockImplementation(async () => {
				throw createError();
			});
			const { storage, items } = createBrowserStorage({
				[identityIdKey]: storedIdentityId,
			});

			await expect(
				fetchGuestCredentials(createProvider(storage)),
			).rejects.toBeInstanceOf(AuthError);
			expect(mockGetId).not.toHaveBeenCalled();
			expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
			expect(items.get(identityIdKey)).toBe(storedIdentityId);
		});
	});

	it('does not recover in the signed-in branch', async () => {
		const { storage } = createBrowserStorage({
			[identityIdKey]: storedIdentityId,
		});

		await expect(
			createProvider(storage).getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: authConfig!,
				tokens: authAPITestParams.ValidAuthTokens,
			}),
		).rejects.toMatchObject({ name: 'ResourceNotFoundException' });
		expect(mockGetId).not.toHaveBeenCalled();
		expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
	});
});
