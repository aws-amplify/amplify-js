// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { prefixResolver } from '../../src/utils/prefixResolver';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../src/errors/types/validation';

describe('prefixResolver', () => {
	it('should resolve guest level', async () => {
		const publicPrefix = await prefixResolver({ level: 'guest' });
		expect(publicPrefix).toEqual('public/');
	});

	it('should resolve protected level', async () => {
		const protectedPrefix = await prefixResolver({
			level: 'protected',
			identityId: 'identityId',
		});
		expect(protectedPrefix).toEqual('protected/identityId/');
	});

	it('should throw if identity id missing when resolving protected level', async () => {
		expect.assertions(1);
		try {
			await prefixResolver({ level: 'protected' });
		} catch (e) {
			expect(e.message).toBe(
				validationErrorMap[StorageValidationErrorCode.NoIdentityId].message
			);
		}
	});

	it('should resolve private level', async () => {
		const privatePrefix = await prefixResolver({
			level: 'private',
			identityId: 'identityId',
		});
		expect(privatePrefix).toEqual('private/identityId/');
	});

	it('should throw if identity id missing when resolving private level', async () => {
		expect.assertions(1);
		try {
			await prefixResolver({ level: 'private' });
		} catch (e) {
			expect(e.message).toBe(
				validationErrorMap[StorageValidationErrorCode.NoIdentityId].message
			);
		}
	});
});
