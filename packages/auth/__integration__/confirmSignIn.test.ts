// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { confirmSignIn, signIn } from '../src';

describe('MFA Challenge Integration Tests', () => {
	describe('confirmSignIn with SMS_MFA', () => {
		it('should successfully confirm sign in with SMS MFA code', async () => {
			// Sign in with user that has SMS MFA enabled
			const signInResult = await signIn({
				username: 'mfauser',
				password: 'TestPassword123!',
			});

			expect(signInResult.isSignedIn).toBe(false);
			expect(signInResult.nextStep.signInStep).toBe(
				'CONFIRM_SIGN_IN_WITH_SMS_CODE',
			);

			// Confirm with MFA code
			const confirmResult = await confirmSignIn({
				challengeResponse: '123456',
			});

			expect(confirmResult.isSignedIn).toBe(true);
			expect(confirmResult.nextStep.signInStep).toBe('DONE');
		});

		it('should throw error for invalid SMS MFA code', async () => {
			await signIn({
				username: 'mfauser',
				password: 'TestPassword123!',
			});

			try {
				await confirmSignIn({
					challengeResponse: 'invalid',
				});
				throw new Error('Should have thrown an error');
			} catch (error: any) {
				expect(error.name).toBe('CodeMismatchException');
				expect(error.message).toContain('Invalid code');
			}
		});
	});

	describe('confirmSignIn with TOTP_MFA', () => {
		it('should successfully confirm sign in with TOTP code', async () => {
			// Sign in with user that has TOTP MFA enabled
			const signInResult = await signIn({
				username: 'totpuser',
				password: 'TestPassword123!',
			});

			expect(signInResult.isSignedIn).toBe(false);
			expect(signInResult.nextStep.signInStep).toBe(
				'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
			);

			// Confirm with TOTP code
			const confirmResult = await confirmSignIn({
				challengeResponse: '123456',
			});

			expect(confirmResult.isSignedIn).toBe(true);
			expect(confirmResult.nextStep.signInStep).toBe('DONE');
		});
	});

	describe('confirmSignIn with NEW_PASSWORD_REQUIRED', () => {
		it('should successfully set new password', async () => {
			// Sign in with user that needs password change
			const signInResult = await signIn({
				username: 'newpassworduser',
				password: 'TempPassword123!',
			});

			expect(signInResult.isSignedIn).toBe(false);
			expect(signInResult.nextStep.signInStep).toBe(
				'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
			);

			// Set new password
			const confirmResult = await confirmSignIn({
				challengeResponse: 'NewPassword123!',
			});

			expect(confirmResult.isSignedIn).toBe(true);
			expect(confirmResult.nextStep.signInStep).toBe('DONE');
		});
	});

	describe('confirmSignIn with CONTINUE_SIGN_IN_WITH_TOTP_SETUP', () => {
		it('should handle TOTP setup during sign in', async () => {
			// MFA_SETUP challenge requires special handling with setUpTOTP
			// This is a complex flow that's better tested in the mfa.test.ts file
			// For now, just verify the challenge is returned correctly
			const signInResult = await signIn({
				username: 'totpsetupuser',
				password: 'TestPassword123!',
			});

			expect(signInResult.isSignedIn).toBe(false);
			expect(signInResult.nextStep.signInStep).toBe(
				'CONTINUE_SIGN_IN_WITH_TOTP_SETUP',
			);
		});
	});

	describe('confirmSignIn validation', () => {
		it('should throw validation error for empty challenge response', async () => {
			await signIn({
				username: 'mfauser',
				password: 'TestPassword123!',
			});

			try {
				await confirmSignIn({
					challengeResponse: '',
				});
				throw new Error('Should have thrown an error');
			} catch (error: any) {
				expect(error.name).toBe('EmptyChallengeResponse');
			}
		});
	});
});
