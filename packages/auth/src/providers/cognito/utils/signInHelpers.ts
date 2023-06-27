// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	getLargeAValue,
	getNowString,
	getPasswordAuthenticationKey,
	getSignatureString,
} from './srp/helpers';
import AuthenticationHelper from './srp/AuthenticationHelper';
import BigInteger from './srp/BigInteger';
import {
	InitiateAuthClientInput,
	initiateAuthClient,
} from './clients/InitiateAuthClient';
import {
	RespondToAuthChallengeClientInput,
	respondToAuthChallengeClient,
} from './clients/RespondToAuthChallengeClient';
import {
	ChallengeName,
	ChallengeParameters,
	CognitoMFAType,
} from './clients/types/models';
import { ClientMetadata, CognitoConfirmSignInOptions } from '../types';
import {
	AdditionalInfo,
	AuthSignInResult,
	AuthSignInStep,
	DeliveryMedium,
} from '../../../types';
import { AuthError } from '../../../errors/AuthError';
import { InitiateAuthException } from '../types/errors';
import {
	AllowedMFATypes,
	AuthUserAttribute,
	TOTPSetupDetails,
} from '../../../types/models';
import { verifySoftwareTokenClient } from './clients/VerifySoftwareTokenClient';

import { associateSoftwareTokenClient } from './clients/AssociateSoftwareTokenClient';
import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { signInStore } from './signInStore';

const USER_ATTRIBUTES = 'userAttributes.';

export async function handleCustomChallenge(
	challengeResponse: string,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	username: string
): Promise<RespondToAuthChallengeCommandOutput> {
	const challengeResponses = { USERNAME: username, ANSWER: challengeResponse };
	const jsonReq: RespondToAuthChallengeClientInput = {
		ChallengeName: 'CUSTOM_CHALLENGE',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
	};
	return await respondToAuthChallengeClient(jsonReq);
}

export async function handleMFASetupChallenge(
	challengeResponse: string,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	username: string,
	deviceName?: string
): Promise<RespondToAuthChallengeCommandOutput> {
	const challengeResponses = {
		USERNAME: username,
	};

	const { Session } = await verifySoftwareTokenClient({
		UserCode: challengeResponse,
		Session: session,
		FriendlyDeviceName: deviceName,
	});

	signInStore.dispatch({
		type: 'SET_ACTIVE_SIGN_IN_SESSION',
		value: Session,
	});

	const jsonReq: RespondToAuthChallengeClientInput = {
		ChallengeName: 'MFA_SETUP',
		ChallengeResponses: challengeResponses,
		Session,
		ClientMetadata: clientMetadata,
	};
	return await respondToAuthChallengeClient(jsonReq);
}

export async function handleSelectMFATypeChallenge(
	challengeResponse: string,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	username: string
): Promise<RespondToAuthChallengeCommandOutput> {
	assertValidationError(
		challengeResponse === 'TOTP' || challengeResponse === 'SMS',
		AuthValidationErrorCode.IncorrectMFAMethod
	);

	const challengeResponses = {
		USERNAME: username,
		ANSWER: mapMfaType(challengeResponse),
	};

	const jsonReq: RespondToAuthChallengeClientInput = {
		ChallengeName: 'SELECT_MFA_TYPE',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
	};

	return await respondToAuthChallengeClient(jsonReq);
}

export async function handleSMSMFAChallenge(
	challengeResponse: string,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	username: string
): Promise<RespondToAuthChallengeCommandOutput> {
	const challengeResponses = {
		USERNAME: username,
		SMS_MFA_CODE: challengeResponse,
	};
	const jsonReq: RespondToAuthChallengeClientInput = {
		ChallengeName: 'SMS_MFA',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
	};

	return await respondToAuthChallengeClient(jsonReq);
}
export async function handleSoftwareTokenMFAChallenge(
	challengeResponse: string,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	username: string
): Promise<RespondToAuthChallengeCommandOutput> {
	const challengeResponses = {
		USERNAME: username,
		SOFTWARE_TOKEN_MFA_CODE: challengeResponse,
	};
	const jsonReq: RespondToAuthChallengeClientInput = {
		ChallengeName: 'SOFTWARE_TOKEN_MFA',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
	};
	return await respondToAuthChallengeClient(jsonReq);
}
export async function handleCompleteNewPasswordChallenge(
	challengeResponse: string,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	username: string,
	requiredAttributes?: AuthUserAttribute
): Promise<RespondToAuthChallengeCommandOutput> {
	const challengeResponses = {
		...createAttributes(requiredAttributes),
		NEW_PASSWORD: challengeResponse,
		USERNAME: username,
	};

	const jsonReq: RespondToAuthChallengeClientInput = {
		ChallengeName: 'NEW_PASSWORD_REQUIRED',
		ChallengeResponses: challengeResponses,
		ClientMetadata: clientMetadata,
		Session: session,
	};

	return await respondToAuthChallengeClient(jsonReq);
}

export async function handleUserPasswordAuthFlow(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined
): Promise<InitiateAuthCommandOutput> {
	const jsonReq: InitiateAuthClientInput = {
		AuthFlow: 'USER_PASSWORD_AUTH',
		AuthParameters: {
			USERNAME: username,
			PASSWORD: password,
		},
		ClientMetadata: clientMetadata,
	};

	return await initiateAuthClient(jsonReq);
}

export async function handleUserSRPAuthFlow(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined
): Promise<RespondToAuthChallengeCommandOutput> {
	const config = Amplify.config;
	const userPoolId = config['aws_user_pools_id'];
	const userPoolName = userPoolId.split('_')[1];
	const authenticationHelper = new AuthenticationHelper(userPoolName);

	const jsonReq: InitiateAuthClientInput = {
		AuthFlow: 'USER_SRP_AUTH',
		AuthParameters: {
			USERNAME: username,
			SRP_A: ((await getLargeAValue(authenticationHelper)) as any).toString(16),
		},
		ClientMetadata: clientMetadata,
	};

	const resp = await initiateAuthClient(jsonReq);
	const { ChallengeParameters: challengeParameters, Session: session } = resp;

	return handlePasswordVerifierChallenge(
		password,
		challengeParameters as ChallengeParameters,
		clientMetadata,
		session,
		authenticationHelper,
		userPoolName
	);
}

export async function handleCustomAuthFlowWithoutSRP(
	username: string,
	clientMetadata: ClientMetadata | undefined
): Promise<InitiateAuthCommandOutput> {
	const jsonReq: InitiateAuthClientInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: {
			USERNAME: username,
		},
		ClientMetadata: clientMetadata,
	};

	return await initiateAuthClient(jsonReq);
}

export async function handleCustomSRPAuthFlow(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined
) {
	const userPoolId = Amplify.config['aws_user_pools_id'];
	const userPoolName = userPoolId.split('_')[1];
	const authenticationHelper = new AuthenticationHelper(userPoolName);
	const jsonReq: InitiateAuthClientInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: {
			USERNAME: username,
			SRP_A: ((await getLargeAValue(authenticationHelper)) as any).toString(16),
			CHALLENGE_NAME: 'SRP_A',
		},
		ClientMetadata: clientMetadata,
	};

	const { ChallengeParameters: challengeParameters, Session: session } =
		await initiateAuthClient(jsonReq);

	return handlePasswordVerifierChallenge(
		password,
		challengeParameters as ChallengeParameters,
		clientMetadata,
		session,
		authenticationHelper,
		userPoolName
	);
}

export async function handlePasswordVerifierChallenge(
	password: string,
	challengeParameters: ChallengeParameters,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	authenticationHelper: AuthenticationHelper,
	userPoolName: string
): Promise<RespondToAuthChallengeCommandOutput> {
	const serverBValue = new BigInteger(challengeParameters?.SRP_B, 16);
	const salt = new BigInteger(challengeParameters?.SALT, 16);
	const username = challengeParameters?.USER_ID_FOR_SRP;
	const hkdf = await getPasswordAuthenticationKey({
		authenticationHelper,
		username,
		password,
		serverBValue,
		salt,
	});

	const dateNow = getNowString();

	const challengeResponses = {
		USERNAME: username,
		PASSWORD_CLAIM_SECRET_BLOCK: challengeParameters?.SECRET_BLOCK,
		TIMESTAMP: dateNow,
		PASSWORD_CLAIM_SIGNATURE: getSignatureString({
			username: challengeParameters?.USER_ID_FOR_SRP,
			userPoolName,
			challengeParameters,
			dateNow,
			hkdf,
		}),
	} as { [key: string]: string };

	const jsonReqResponseChallenge: RespondToAuthChallengeClientInput = {
		ChallengeName: 'PASSWORD_VERIFIER',
		ChallengeResponses: challengeResponses,
		ClientMetadata: clientMetadata,
		Session: session,
	};

	return await respondToAuthChallengeClient(jsonReqResponseChallenge);
}

export async function getSignInResult(params: {
	challengeName: ChallengeName;
	challengeParameters: ChallengeParameters;
}): Promise<AuthSignInResult> {
	const { challengeName, challengeParameters } = params;

	switch (challengeName) {
		case 'CUSTOM_CHALLENGE':
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE,
					additionalInfo: challengeParameters as AdditionalInfo,
				},
			};
		case 'MFA_SETUP':
			const { activeSignInSession, username } = signInStore.getState();
			const { Session, SecretCode: secretCode } =
				await associateSoftwareTokenClient({
					Session: activeSignInSession,
				});
			signInStore.dispatch({
				type: 'SET_ACTIVE_SIGN_IN_SESSION',
				value: Session,
			});

			return {
				isSignedIn: false,
				nextStep: {
					signInStep: AuthSignInStep.CONTINUE_SIGN_IN_WITH_TOTP_SETUP,
					totpSetupDetails: getTOTPSetupDetails(secretCode!, username),
				},
			};
		case 'NEW_PASSWORD_REQUIRED':
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED,
					missingAttributes: parseAttributes(
						challengeParameters.requiredAttributes
					),
				},
			};
		case 'SELECT_MFA_TYPE':
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: AuthSignInStep.CONTINUE_SIGN_IN_WITH_MFA_SELECTION,
					allowedMFATypes: parseMFATypes(challengeParameters.MFAS_CAN_CHOOSE),
				},
			};
		case 'SMS_MFA':
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_CODE,
					codeDeliveryDetails: {
						deliveryMedium:
							challengeParameters.CODE_DELIVERY_DELIVERY_MEDIUM as DeliveryMedium,
						destination: challengeParameters.CODE_DELIVERY_DESTINATION,
					},
				},
			};
		case 'SOFTWARE_TOKEN_MFA':
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_TOTP_CODE,
				},
			};
		case 'ADMIN_NO_SRP_AUTH':
			break;
		case 'DEVICE_PASSWORD_VERIFIER':
			break;
		case 'DEVICE_SRP_AUTH':
			break;
		case 'PASSWORD_VERIFIER':
			break;
	}

	throw new AuthError({
		name: AuthErrorCodes.SignInException,
		message: `An error occurred during the sign in process. 
		${challengeName} challengeName returned by the underlying service was not addressed.`,
	});
}

export function getTOTPSetupDetails(
	secretCode: string,
	username?: string
): TOTPSetupDetails {
	return {
		sharedSecret: secretCode,
		getSetupUri: (appName, accountName) => {
			const totpUri = `otpauth://totp/${appName}:${
				accountName ?? username
			}?secret=${secretCode}&issuer=${appName}`;
			const url = new URL(totpUri);
			return url;
		},
	};
}

export function getSignInResultFromError(
	errorName: string
): AuthSignInResult | undefined {
	if (errorName === InitiateAuthException.PasswordResetRequiredException) {
		return {
			isSignedIn: false,
			nextStep: { signInStep: AuthSignInStep.RESET_PASSWORD },
		};
	} else if (errorName === InitiateAuthException.UserNotConfirmedException) {
		return {
			isSignedIn: false,
			nextStep: { signInStep: AuthSignInStep.CONFIRM_SIGN_UP },
		};
	}
}

export function parseAttributes(attributes: string | undefined): string[] {
	if (!attributes) return [];
	const parsedAttributes = (JSON.parse(attributes) as Array<string>).map(att =>
		att.includes(USER_ATTRIBUTES) ? att.replace(USER_ATTRIBUTES, '') : att
	);

	return parsedAttributes;
}

export function createAttributes(
	attributes?: AuthUserAttribute
): Record<string, string> {
	if (!attributes) return {};

	const newAttributes = {};

	Object.entries(attributes).forEach(([key, value]) => {
		newAttributes[`${USER_ATTRIBUTES}${key}`] = value;
	});
	return newAttributes;
}

export async function handleChallengeName(
	username: string,
	challengeName: ChallengeName,
	session: string,
	challengeResponse: string,
	clientMetadata?: ClientMetadata,
	options?: CognitoConfirmSignInOptions
): Promise<RespondToAuthChallengeCommandOutput> {
	const userAttributes = options?.userAttributes;
	const deviceName = options?.friendlyDeviceName;

	switch (challengeName) {
		case 'SMS_MFA':
			return await handleSMSMFAChallenge(
				challengeResponse,
				clientMetadata,
				session,
				username
			);
		case 'SELECT_MFA_TYPE':
			return await handleSelectMFATypeChallenge(
				challengeResponse,
				clientMetadata,
				session,
				username
			);
		case 'MFA_SETUP':
			return await handleMFASetupChallenge(
				challengeResponse,
				clientMetadata,
				session,
				username,
				deviceName
			);
		case 'NEW_PASSWORD_REQUIRED':
			return await handleCompleteNewPasswordChallenge(
				challengeResponse,
				clientMetadata,
				session,
				username,
				userAttributes
			);
		case 'CUSTOM_CHALLENGE':
			return await handleCustomChallenge(
				challengeResponse,
				clientMetadata,
				session,
				username
			);
		case 'SOFTWARE_TOKEN_MFA':
			return await handleSoftwareTokenMFAChallenge(
				challengeResponse,
				clientMetadata,
				session,
				username
			);
	}

	throw new AuthError({
		name: AuthErrorCodes.SignInException,
		message: `An error occurred during the sign in process. 
		${challengeName} challengeName returned by the underlying service was not addressed.`,
	});
}

export function mapMfaType(mfa: string): CognitoMFAType {
	let mfaType = 'SMS_MFA';
	if (mfa === 'TOTP') mfaType = 'SOFTWARE_TOKEN_MFA';

	return mfaType as CognitoMFAType;
}

export function parseMFATypes(mfa?: string): AllowedMFATypes {
	if (!mfa) return [];
	const parsedMfaTypes: AllowedMFATypes = [];
	(JSON.parse(mfa) as CognitoMFAType[]).map(type => {
		if (type === 'SMS_MFA') parsedMfaTypes.push('SMS');
		if (type === 'SOFTWARE_TOKEN_MFA') parsedMfaTypes.push('TOTP');
	});
	return parsedMfaTypes;
}
