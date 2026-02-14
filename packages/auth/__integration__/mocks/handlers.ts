// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse, http } from 'msw';

/**
 * Centralized test data for integration tests
 */
export const mockTokens = {
	accessToken:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMzQ1Iiwibm FtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.4Adcj0pW6hGnT5bCz0FnXqBfXJfKs5wXb4FnXqBfXJc',
	idToken:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMzQ1IiwiY29nbml0bzp1c2VybmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.4Adcj0pW6hGnT5bCz0FnXqBfXJfKs5wXb4FnXqBfXJc',
	refreshToken: 'mock-refresh-token-12345',
	expiresIn: 3600,
	tokenType: 'Bearer' as const,
};

export const mockUser = {
	userId: 'user-12345',
	username: 'testuser',
	email: 'test@example.com',
	name: 'Test User',
	emailVerified: true,
};

export const mockCodeDelivery = {
	email: {
		destination: 't***@e***.com',
		deliveryMedium: 'EMAIL' as const,
		attributeName: 'email',
	},
	phone: {
		destination: '+1***1234',
		deliveryMedium: 'SMS' as const,
		attributeName: 'phone_number',
	},
};

export const mockDevice = {
	deviceKey: 'device-12345',
	deviceGroupKey: 'device-group-key-12345',
	deviceName: 'Test Device',
	lastIpUsed: '192.168.1.1',
};

export const mockWebAuthn = {
	credentialId: 'credential-12345',
	friendlyName: 'My Security Key',
	relyingPartyId: 'example.com',
	authenticatorTransports: ['usb', 'nfc'] as const,
	challenge: 'mock-challenge-data',
};

export const mockMFA = {
	totpSecretCode: 'JBSWY3DPEHPK3PXP',
	sessionToken: 'mock-session-token',
	preferredMfaSetting: 'SOFTWARE_TOKEN_MFA' as const,
};

export const mockSRP = {
	salt: 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=',
	secretBlock: 'bW9jay1zZWNyZXQtYmxvY2stZGF0YQ==',
	srpB: 'bW9jay1zcnAtYi12YWx1ZQ==',
};

export const mockUserAttributes = [
	{ Name: 'sub', Value: mockUser.userId },
	{ Name: 'email', Value: mockUser.email },
	{ Name: 'email_verified', Value: 'true' },
	{ Name: 'name', Value: mockUser.name },
];

/**
 * Mock handlers for AWS Cognito API requests
 * All Cognito API calls go to the same endpoint, so we use a single handler
 * that routes based on the x-amz-target header
 */
export const handlers = [
	http.post(
		'https://cognito-idp.us-west-2.amazonaws.com/',
		async ({ request }) => {
			const body = (await request.json()) as Record<string, unknown>;
			const target = request.headers.get('x-amz-target');

			// SignUp - User registration
			if (target === 'AWSCognitoIdentityProviderService.SignUp') {
				const { Username, Password } = body as {
					Username: string;
					Password: string;
				};

				// Simulate validation errors
				if (!Username) {
					return HttpResponse.json(
						{
							__type: 'InvalidParameterException',
							message: 'Username is required',
						},
						{ status: 400 },
					);
				}

				if (!Password) {
					return HttpResponse.json(
						{
							__type: 'InvalidParameterException',
							message: 'Password is required',
						},
						{ status: 400 },
					);
				}

				// Simulate user already exists
				if (Username === 'existinguser') {
					return HttpResponse.json(
						{
							__type: 'UsernameExistsException',
							message: 'An account with the given email already exists.',
						},
						{ status: 400 },
					);
				}

				// For autosigninmfauser, return UserConfirmed: true to trigger auto sign in with MFA
				if (Username === 'autosigninmfauser') {
					return HttpResponse.json({
						UserConfirmed: true,
						UserSub: 'user-mfa-12345',
					});
				}

				return HttpResponse.json({
					UserConfirmed: false,
					UserSub: mockUser.userId,
					CodeDeliveryDetails: {
						Destination: mockCodeDelivery.email.destination,
						DeliveryMedium: mockCodeDelivery.email.deliveryMedium,
						AttributeName: mockCodeDelivery.email.attributeName,
					},
				});
			}

			// ConfirmSignUp - Confirm user registration
			if (target === 'AWSCognitoIdentityProviderService.ConfirmSignUp') {
				const { ConfirmationCode } = body as { ConfirmationCode: string };

				// Simulate invalid code
				if (ConfirmationCode === 'invalid') {
					return HttpResponse.json(
						{
							__type: 'CodeMismatchException',
							message: 'Invalid verification code provided, please try again.',
						},
						{ status: 400 },
					);
				}

				return HttpResponse.json({});
			}

			// ResendConfirmationCode - Resend sign up code
			if (
				target === 'AWSCognitoIdentityProviderService.ResendConfirmationCode'
			) {
				return HttpResponse.json({
					CodeDeliveryDetails: {
						Destination: mockCodeDelivery.email.destination,
						DeliveryMedium: mockCodeDelivery.email.deliveryMedium,
						AttributeName: mockCodeDelivery.email.attributeName,
					},
				});
			}

			// InitiateAuth - Sign in initiation
			if (target === 'AWSCognitoIdentityProviderService.InitiateAuth') {
				const { AuthFlow, AuthParameters } = body as {
					AuthFlow: string;
					AuthParameters: Record<string, string>;
				};

				const username = AuthParameters?.USERNAME;

				// Simulate user not found
				if (username === 'nonexistent') {
					return HttpResponse.json(
						{
							__type: 'UserNotFoundException',
							message: 'User does not exist.',
						},
						{ status: 400 },
					);
				}

				// Simulate users with different MFA/challenge scenarios
				if (username === 'mfauser') {
					return HttpResponse.json({
						ChallengeName: 'SMS_MFA',
						Session: mockMFA.sessionToken,
						ChallengeParameters: {
							CODE_DELIVERY_DELIVERY_MEDIUM:
								mockCodeDelivery.phone.deliveryMedium,
							CODE_DELIVERY_DESTINATION: mockCodeDelivery.phone.destination,
						},
					});
				}

				if (username === 'totpuser') {
					return HttpResponse.json({
						ChallengeName: 'SOFTWARE_TOKEN_MFA',
						Session: mockMFA.sessionToken,
						ChallengeParameters: {},
					});
				}

				if (username === 'newpassworduser') {
					return HttpResponse.json({
						ChallengeName: 'NEW_PASSWORD_REQUIRED',
						Session: mockMFA.sessionToken,
						ChallengeParameters: {
							USER_ID_FOR_SRP: username,
						},
					});
				}

				if (username === 'totpsetupuser') {
					return HttpResponse.json({
						ChallengeName: 'MFA_SETUP',
						Session: mockMFA.sessionToken,
						ChallengeParameters: {
							MFAS_CAN_SETUP: '["SOFTWARE_TOKEN_MFA"]',
						},
					});
				}

				// For USER_SRP_AUTH flow, return PASSWORD_VERIFIER challenge
				if (AuthFlow === 'USER_SRP_AUTH') {
					return HttpResponse.json({
						ChallengeName: 'PASSWORD_VERIFIER',
						ChallengeParameters: {
							SALT: mockSRP.salt,
							SECRET_BLOCK: mockSRP.secretBlock,
							SRP_B: mockSRP.srpB,
							USERNAME: username || mockUser.username,
							USER_ID_FOR_SRP: username || mockUser.username,
						},
					});
				}

				// For USER_PASSWORD_AUTH flow (if used), check password
				if (AuthFlow === 'USER_PASSWORD_AUTH') {
					if (AuthParameters?.PASSWORD === 'wrongpassword') {
						return HttpResponse.json(
							{
								__type: 'NotAuthorizedException',
								message: 'Incorrect username or password.',
							},
							{ status: 400 },
						);
					}

					// Successful sign in
					return HttpResponse.json({
						AuthenticationResult: {
							AccessToken: mockTokens.accessToken,
							IdToken: mockTokens.idToken,
							RefreshToken: mockTokens.refreshToken,
							ExpiresIn: mockTokens.expiresIn,
							TokenType: mockTokens.tokenType,
						},
					});
				}

				// Default response
				return HttpResponse.json({
					AuthenticationResult: {
						AccessToken: mockTokens.accessToken,
						IdToken: mockTokens.idToken,
						RefreshToken: mockTokens.refreshToken,
						ExpiresIn: mockTokens.expiresIn,
						TokenType: mockTokens.tokenType,
					},
				});
			}

			// RespondToAuthChallenge - Handle SRP challenge response
			if (
				target === 'AWSCognitoIdentityProviderService.RespondToAuthChallenge'
			) {
				const { ChallengeName, ChallengeResponses } = body as {
					ChallengeName: string;
					ChallengeResponses: Record<string, string>;
					Session?: string;
				};

				// Handle PASSWORD_VERIFIER challenge
				if (ChallengeName === 'PASSWORD_VERIFIER') {
					return HttpResponse.json({
						AuthenticationResult: {
							AccessToken: mockTokens.accessToken,
							IdToken: mockTokens.idToken,
							RefreshToken: mockTokens.refreshToken,
							ExpiresIn: mockTokens.expiresIn,
							TokenType: mockTokens.tokenType,
							// Include device metadata for device tracking tests
							NewDeviceMetadata: {
								DeviceKey: mockDevice.deviceKey,
								DeviceGroupKey: mockDevice.deviceGroupKey,
							},
						},
					});
				}

				// Handle SMS_MFA challenge
				if (ChallengeName === 'SMS_MFA') {
					const code = ChallengeResponses?.SMS_MFA_CODE;

					if (code === 'invalid') {
						return HttpResponse.json(
							{
								__type: 'CodeMismatchException',
								message: 'Invalid code provided, please request a code again.',
							},
							{ status: 400 },
						);
					}

					return HttpResponse.json({
						AuthenticationResult: {
							AccessToken: mockTokens.accessToken,
							IdToken: mockTokens.idToken,
							RefreshToken: mockTokens.refreshToken,
							ExpiresIn: mockTokens.expiresIn,
							TokenType: mockTokens.tokenType,
						},
					});
				}

				// Handle SOFTWARE_TOKEN_MFA challenge
				if (ChallengeName === 'SOFTWARE_TOKEN_MFA') {
					const code = ChallengeResponses?.SOFTWARE_TOKEN_MFA_CODE;

					if (code === 'invalid') {
						return HttpResponse.json(
							{
								__type: 'CodeMismatchException',
								message: 'Invalid code provided, please request a code again.',
							},
							{ status: 400 },
						);
					}

					return HttpResponse.json({
						AuthenticationResult: {
							AccessToken: mockTokens.accessToken,
							IdToken: mockTokens.idToken,
							RefreshToken: mockTokens.refreshToken,
							ExpiresIn: mockTokens.expiresIn,
							TokenType: mockTokens.tokenType,
						},
					});
				}

				// Handle NEW_PASSWORD_REQUIRED challenge
				if (ChallengeName === 'NEW_PASSWORD_REQUIRED') {
					return HttpResponse.json({
						AuthenticationResult: {
							AccessToken: mockTokens.accessToken,
							IdToken: mockTokens.idToken,
							RefreshToken: mockTokens.refreshToken,
							ExpiresIn: mockTokens.expiresIn,
							TokenType: mockTokens.tokenType,
						},
					});
				}

				// Handle MFA_SETUP challenge
				if (ChallengeName === 'MFA_SETUP') {
					return HttpResponse.json({
						AuthenticationResult: {
							AccessToken: mockTokens.accessToken,
							IdToken: mockTokens.idToken,
							RefreshToken: mockTokens.refreshToken,
							ExpiresIn: mockTokens.expiresIn,
							TokenType: mockTokens.tokenType,
						},
					});
				}

				// Default error for unhandled challenges
				return HttpResponse.json(
					{
						__type: 'NotAuthorizedException',
						message: 'Incorrect username or password.',
					},
					{ status: 400 },
				);
			}

			// ForgotPassword - Password reset initiation
			if (target === 'AWSCognitoIdentityProviderService.ForgotPassword') {
				return HttpResponse.json({
					CodeDeliveryDetails: {
						Destination: mockCodeDelivery.email.destination,
						DeliveryMedium: mockCodeDelivery.email.deliveryMedium,
						AttributeName: mockCodeDelivery.email.attributeName,
					},
				});
			}

			// ConfirmForgotPassword - Confirm password reset
			if (
				target === 'AWSCognitoIdentityProviderService.ConfirmForgotPassword'
			) {
				const { ConfirmationCode } = body as { ConfirmationCode: string };

				// Simulate invalid code
				if (ConfirmationCode === 'invalid') {
					return HttpResponse.json(
						{
							__type: 'CodeMismatchException',
							message: 'Invalid verification code provided, please try again.',
						},
						{ status: 400 },
					);
				}

				return HttpResponse.json({});
			}

			// ChangePassword - Update password
			if (target === 'AWSCognitoIdentityProviderService.ChangePassword') {
				const { PreviousPassword } = body as { PreviousPassword: string };

				// Simulate incorrect old password
				if (PreviousPassword === 'wrongpassword') {
					return HttpResponse.json(
						{
							__type: 'NotAuthorizedException',
							message: 'Incorrect username or password.',
						},
						{ status: 400 },
					);
				}

				return HttpResponse.json({});
			}

			// AssociateSoftwareToken - TOTP setup
			if (
				target === 'AWSCognitoIdentityProviderService.AssociateSoftwareToken'
			) {
				return HttpResponse.json({
					SecretCode: mockMFA.totpSecretCode,
				});
			}

			// VerifySoftwareToken - TOTP verification
			if (target === 'AWSCognitoIdentityProviderService.VerifySoftwareToken') {
				const { UserCode } = body as { UserCode: string };

				// Simulate invalid code
				if (UserCode === 'invalid') {
					return HttpResponse.json(
						{
							__type: 'EnableSoftwareTokenMFAException',
							message: 'Invalid code provided.',
						},
						{ status: 400 },
					);
				}

				return HttpResponse.json({
					Status: 'SUCCESS',
				});
			}

			// SetUserMFAPreference - Update MFA preference
			if (target === 'AWSCognitoIdentityProviderService.SetUserMFAPreference') {
				return HttpResponse.json({});
			}

			// GetUser - Fetch user attributes and MFA preference
			if (target === 'AWSCognitoIdentityProviderService.GetUser') {
				return HttpResponse.json({
					Username: mockUser.username,
					UserAttributes: mockUserAttributes,
					PreferredMfaSetting: mockMFA.preferredMfaSetting,
					UserMFASettingList: [mockMFA.preferredMfaSetting],
				});
			}

			// UpdateUserAttributes - Update user attributes
			if (target === 'AWSCognitoIdentityProviderService.UpdateUserAttributes') {
				const { UserAttributes } = body as {
					UserAttributes: { Name: string; Value: string }[];
				};

				// Check if email is being updated (requires verification)
				const emailUpdate = UserAttributes?.find(attr => attr.Name === 'email');

				if (emailUpdate) {
					return HttpResponse.json({
						CodeDeliveryDetailsList: [
							{
								AttributeName: 'email',
								DeliveryMedium: 'EMAIL',
								Destination: 'n***@e***.com',
							},
						],
					});
				}

				return HttpResponse.json({
					CodeDeliveryDetailsList: [],
				});
			}

			// DeleteUser - Delete user account
			if (target === 'AWSCognitoIdentityProviderService.DeleteUser') {
				return HttpResponse.json({});
			}

			// GlobalSignOut - Sign out from all devices
			if (target === 'AWSCognitoIdentityProviderService.GlobalSignOut') {
				return HttpResponse.json({});
			}

			// RevokeToken - Revoke refresh token
			if (target === 'AWSCognitoIdentityProviderService.RevokeToken') {
				return HttpResponse.json({});
			}

			// GetUserAttributeVerificationCode - Send verification code for attribute
			if (
				target ===
				'AWSCognitoIdentityProviderService.GetUserAttributeVerificationCode'
			) {
				const { AttributeName } = body as { AttributeName: string };

				const codeDelivery =
					AttributeName === 'phone_number'
						? mockCodeDelivery.phone
						: mockCodeDelivery.email;

				return HttpResponse.json({
					CodeDeliveryDetails: {
						AttributeName,
						DeliveryMedium: codeDelivery.deliveryMedium,
						Destination: codeDelivery.destination,
					},
				});
			}

			// VerifyUserAttribute - Confirm user attribute with code
			if (target === 'AWSCognitoIdentityProviderService.VerifyUserAttribute') {
				const { Code } = body as { Code: string };

				// Simulate invalid code
				if (Code === 'invalid') {
					return HttpResponse.json(
						{
							__type: 'CodeMismatchException',
							message: 'Invalid verification code provided, please try again.',
						},
						{ status: 400 },
					);
				}

				return HttpResponse.json({});
			}

			// DeleteUserAttributes - Delete user attributes
			if (target === 'AWSCognitoIdentityProviderService.DeleteUserAttributes') {
				return HttpResponse.json({});
			}

			// UpdateDeviceStatus - Remember or forget device
			if (target === 'AWSCognitoIdentityProviderService.UpdateDeviceStatus') {
				return HttpResponse.json({});
			}

			// ForgetDevice - Forget a specific device
			if (target === 'AWSCognitoIdentityProviderService.ForgetDevice') {
				return HttpResponse.json({});
			}

			// ConfirmDevice - Confirm device for tracking
			if (target === 'AWSCognitoIdentityProviderService.ConfirmDevice') {
				return HttpResponse.json({
					UserConfirmationNecessary: false,
				});
			}

			// ListDevices - List user's remembered devices
			if (target === 'AWSCognitoIdentityProviderService.ListDevices') {
				return HttpResponse.json({
					Devices: [
						{
							DeviceKey: mockDevice.deviceKey,
							DeviceAttributes: [
								{ Name: 'device_name', Value: mockDevice.deviceName },
								{ Name: 'last_ip_used', Value: mockDevice.lastIpUsed },
							],
							DeviceCreateDate: new Date().toISOString(),
							DeviceLastModifiedDate: new Date().toISOString(),
							DeviceLastAuthenticatedDate: new Date().toISOString(),
						},
					],
				});
			}

			// StartWebAuthnRegistration - Start WebAuthn credential registration
			if (
				target === 'AWSCognitoIdentityProviderService.StartWebAuthnRegistration'
			) {
				return HttpResponse.json({
					CredentialCreationOptions: {
						challenge: mockWebAuthn.challenge,
						rp: {
							name: 'Test App',
							id: mockWebAuthn.relyingPartyId,
						},
						user: {
							id: mockUser.userId,
							name: mockUser.username,
							displayName: mockUser.name,
						},
						pubKeyCredParams: [
							{ type: 'public-key', alg: -7 },
							{ type: 'public-key', alg: -257 },
						],
					},
				});
			}

			// CompleteWebAuthnRegistration - Complete WebAuthn credential registration
			if (
				target ===
				'AWSCognitoIdentityProviderService.CompleteWebAuthnRegistration'
			) {
				return HttpResponse.json({
					CredentialId: mockWebAuthn.credentialId,
				});
			}

			// ListWebAuthnCredentials - List user's WebAuthn credentials
			if (
				target === 'AWSCognitoIdentityProviderService.ListWebAuthnCredentials'
			) {
				return HttpResponse.json({
					Credentials: [
						{
							CredentialId: mockWebAuthn.credentialId,
							FriendlyCredentialName: mockWebAuthn.friendlyName,
							RelyingPartyId: mockWebAuthn.relyingPartyId,
							AuthenticatorTransports: mockWebAuthn.authenticatorTransports,
							CreatedAt: new Date().toISOString(),
						},
					],
				});
			}

			// DeleteWebAuthnCredential - Delete a WebAuthn credential
			if (
				target === 'AWSCognitoIdentityProviderService.DeleteWebAuthnCredential'
			) {
				return HttpResponse.json({});
			}

			// Unknown target
			return HttpResponse.json(
				{ __type: 'UnknownError', message: `Unknown target: ${target}` },
				{ status: 400 },
			);
		},
	),
];
