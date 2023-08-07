// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { prefixResolver } from '../../src/utils/prefixResolver';
import {
	validationErrorMap,
	StorageValidationErrorCode,
} from '../../src/errors/types/validation';

describe('prefixResolver', () => {
	it('should return the correct prefix for private access level', async () => {
		const prefix = await prefixResolver({
			accessLevel: 'private',
			targetIdentityId: 'identityId',
		});
		expect(prefix).toBe('private/identityId/');
	});

	it('should return the correct prefix for protected access level', async () => {
		const prefix = await prefixResolver({
			accessLevel: 'protected',
			targetIdentityId: 'identityId',
		});
		expect(prefix).toBe('protected/identityId/');
	});

	it('should return the correct prefix for public access level', async () => {
		const prefix = await prefixResolver({
			accessLevel: 'guest',
		});
		expect(prefix).toBe('public/');
	});

	it('should throw an error for private access level without targetIdentityId', async () => {
		try {
			await prefixResolver({
				accessLevel: 'private',
			});
		} catch (error) {
			expect(error).toMatchObject(
				validationErrorMap[StorageValidationErrorCode.NoIdentityId]
			);
		}
	});

	it('should throw an error for protected access level without targetIdentityId', async () => {
		try {
			await prefixResolver({
				accessLevel: 'protected',
			});
		} catch (error) {
			expect(error).toMatchObject(
				validationErrorMap[StorageValidationErrorCode.NoIdentityId]
			);
		}
	});
});
