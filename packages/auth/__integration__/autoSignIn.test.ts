// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { autoSignIn } from '../src';

describe('Auto Sign In Integration Tests', () => {
	describe('autoSignIn', () => {
		it('should throw error when auto sign in is not enabled', async () => {
			// autoSignIn requires the flow to be initiated via signUp with autoSignIn: true
			// Without that setup, it should throw an error
			try {
				await autoSignIn();
				throw new Error('Should have thrown an error');
			} catch (error: any) {
				expect(error.name).toBe('AutoSignInException');
				expect(error.message).toContain('not started');
			}
		});
	});
});
