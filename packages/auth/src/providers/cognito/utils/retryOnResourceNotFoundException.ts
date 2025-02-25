// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../errors/AuthError';
import { AuthTokenOrchestrator } from '../tokenProvider/types';

/**
 * It will retry the function if the error is a `ResourceNotFoundException` and
 * will clean the device keys stored in the storage mechanism.
 *
 */
export async function retryOnResourceNotFoundException<
	F extends (...args: any[]) => any,
>(
	func: F,
	args: Parameters<F>,
	username: string,
	tokenOrchestrator: AuthTokenOrchestrator,
): Promise<ReturnType<F>> {
	try {
		return await func(...args);
	} catch (error) {
		if (
			error instanceof AuthError &&
			error.name === 'ResourceNotFoundException' &&
			error.message.includes('Device does not exist.')
		) {
			await tokenOrchestrator.clearDeviceMetadata(username);

			return func(...args);
		}
		throw error;
	}
}
