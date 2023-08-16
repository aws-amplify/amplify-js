// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyV6,
	AuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core';
import {
	getLargeAValue,
	getNowString,
	getPasswordAuthenticationKey,
	getSignatureString,
} from './srp/helpers';
import AuthenticationHelper from './srp/AuthenticationHelper';
import BigInteger from './srp/BigInteger';

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
	AuthUserAttribute,
	MFAType,
	TOTPSetupDetails,
} from '../../../types/models';
import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { signInStore } from './signInStore';
import {
	initiateAuth,
	respondToAuthChallenge,
	verifySoftwareToken,
	associateSoftwareToken,
} from './clients/CognitoIdentityProvider';
import {
	ChallengeName,
	ChallengeParameters,
	CognitoMFAType,
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommandOutput,
} from './clients/CognitoIdentityProvider/types';
import { getRegion } from './clients/CognitoIdentityProvider/utils';

const USER_ATTRIBUTES = 'userAttributes.';

type HandleAuthChallengeRequest = {
	challengeResponse: string;
	username: string;
	clientMetadata?: ClientMetadata;
	session?: string;
	deviceName?: string;
	requiredAttributes?: AuthUserAttribute;
	config: AuthConfig;
};

export async function handleCustomChallenge({
	challengeResponse,
	clientMetadata,
	session,
	username,
}: HandleAuthChallengeRequest): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolWebClientId } = AmplifyV6.getConfig().Auth;
	const challengeResponses = { USERNAME: username, ANSWER: challengeResponse };
	const jsonReq: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'CUSTOM_CHALLENGE',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};

	return respondToAuthChallenge({ region: getRegion(userPoolId) }, jsonReq);
}

export async function handleMFASetupChallenge({
	challengeResponse,
	username,
	clientMetadata,
	session,
	deviceName,
	config,
}: HandleAuthChallengeRequest): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolWebClientId } = config;
	const challengeResponses = {
		USERNAME: username,
	};

	const { Session } = await verifySoftwareToken(
		{ region: getRegion(userPoolId) },
		{
			UserCode: challengeResponse,
			Session: session,
			FriendlyDeviceName: deviceName,
		}
	);

	signInStore.dispatch({
		type: 'SET_SIGN_IN_SESSION',
		value: Session,
	});

	const jsonReq: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'MFA_SETUP',
		ChallengeResponses: challengeResponses,
		Session,
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};
	return respondToAuthChallenge({ region: getRegion(userPoolId) }, jsonReq);
}

export async function handleSelectMFATypeChallenge({
	challengeResponse,
	username,
	clientMetadata,
	session,
	config,
}: HandleAuthChallengeRequest): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolWebClientId } = config;
	assertValidationError(
		challengeResponse === 'TOTP' || challengeResponse === 'SMS',
		AuthValidationErrorCode.IncorrectMFAMethod
	);

	const challengeResponses = {
		USERNAME: username,
		ANSWER: mapMfaType(challengeResponse),
	};

	const jsonReq: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'SELECT_MFA_TYPE',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};

	return respondToAuthChallenge({ region: getRegion(userPoolId) }, jsonReq);
}

export async function handleSMSMFAChallenge({
	challengeResponse,
	clientMetadata,
	session,
	username,
	config,
}: HandleAuthChallengeRequest): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolWebClientId } = config;
	const challengeResponses = {
		USERNAME: username,
		SMS_MFA_CODE: challengeResponse,
	};
	const jsonReq: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'SMS_MFA',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};

	return respondToAuthChallenge({ region: getRegion(userPoolId) }, jsonReq);
}
export async function handleSoftwareTokenMFAChallenge({
	challengeResponse,
	clientMetadata,
	session,
	username,
	config,
}: HandleAuthChallengeRequest): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolWebClientId } = config;
	const challengeResponses = {
		USERNAME: username,
		SOFTWARE_TOKEN_MFA_CODE: challengeResponse,
	};
	const jsonReq: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'SOFTWARE_TOKEN_MFA',
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};
	return respondToAuthChallenge({ region: getRegion(userPoolId) }, jsonReq);
}
export async function handleCompleteNewPasswordChallenge({
	challengeResponse,
	clientMetadata,
	session,
	username,
	requiredAttributes,
	config,
}: HandleAuthChallengeRequest): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolWebClientId } = config;
	const challengeResponses = {
		...createAttributes(requiredAttributes),
		NEW_PASSWORD: challengeResponse,
		USERNAME: username,
	};

	const jsonReq: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'NEW_PASSWORD_REQUIRED',
		ChallengeResponses: challengeResponses,
		ClientMetadata: clientMetadata,
		Session: session,
		ClientId: userPoolWebClientId,
	};

	return respondToAuthChallenge({ region: getRegion(userPoolId) }, jsonReq);
}

export async function handleUserPasswordAuthFlow(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined,
	{ userPoolId, userPoolWebClientId }: AuthConfig
): Promise<InitiateAuthCommandOutput> {
	const jsonReq: InitiateAuthCommandInput = {
		AuthFlow: 'USER_PASSWORD_AUTH',
		AuthParameters: {
			USERNAME: username,
			PASSWORD: password,
		},
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};

	return initiateAuth({ region: getRegion(userPoolId) }, jsonReq);
}

export async function handleUserSRPAuthFlow(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined,
	config: AuthConfig
): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolWebClientId } = config;
	const userPoolName = userPoolId?.split('_')[1] || '';
	const authenticationHelper = new AuthenticationHelper(userPoolName);

	const jsonReq: InitiateAuthCommandInput = {
		AuthFlow: 'USER_SRP_AUTH',
		AuthParameters: {
			USERNAME: username,
			SRP_A: ((await getLargeAValue(authenticationHelper)) as any).toString(16),
		},
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};

	const resp = await initiateAuth({ region: getRegion(userPoolId) }, jsonReq);
	const { ChallengeParameters: challengeParameters, Session: session } = resp;

	return handlePasswordVerifierChallenge(
		password,
		challengeParameters as ChallengeParameters,
		clientMetadata,
		session,
		authenticationHelper,
		config
	);
}

export async function handleCustomAuthFlowWithoutSRP(
	username: string,
	clientMetadata: ClientMetadata | undefined,
	{ userPoolId, userPoolWebClientId }: AuthConfig
): Promise<InitiateAuthCommandOutput> {
	const jsonReq: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: {
			USERNAME: username,
		},
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};

	return initiateAuth({ region: getRegion(userPoolId) }, jsonReq);
}

export async function handleCustomSRPAuthFlow(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined,
	config: AuthConfig
) {
	const { userPoolId, userPoolWebClientId } = config;
	assertTokenProviderConfig(config);

	const userPoolName = userPoolId?.split('_')[1] || '';
	const authenticationHelper = new AuthenticationHelper(userPoolName);
	const jsonReq: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: {
			USERNAME: username,
			SRP_A: ((await getLargeAValue(authenticationHelper)) as any).toString(16),
			CHALLENGE_NAME: 'SRP_A',
		},
		ClientMetadata: clientMetadata,
		ClientId: userPoolWebClientId,
	};

	const { ChallengeParameters: challengeParameters, Session: session } =
		await initiateAuth({ region: getRegion(userPoolId) }, jsonReq);

	return handlePasswordVerifierChallenge(
		password,
		challengeParameters as ChallengeParameters,
		clientMetadata,
		session,
		authenticationHelper,
		config
	);
}

export async function handlePasswordVerifierChallenge(
	password: string,
	challengeParameters: ChallengeParameters,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	authenticationHelper: AuthenticationHelper,
	{ userPoolId, userPoolWebClientId }: AuthConfig
): Promise<RespondToAuthChallengeCommandOutput> {
	const userPoolName = userPoolId?.split('_')[1] || '';
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

	const jsonReqResponseChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'PASSWORD_VERIFIER',
		ChallengeResponses: challengeResponses,
		ClientMetadata: clientMetadata,
		Session: session,
		ClientId: userPoolWebClientId,
	};

	return respondToAuthChallenge(
		{ region: getRegion(userPoolId) },
		jsonReqResponseChallenge
	);
}

export async function getSignInResult(params: {
	challengeName: ChallengeName;
	challengeParameters: ChallengeParameters;
}): Promise<AuthSignInResult> {
	const { challengeName, challengeParameters } = params;
	const { userPoolId } = AmplifyV6.getConfig().Auth;
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
			const { signInSession, username } = signInStore.getState();

			if (!isMFATypeEnabled(challengeParameters, 'TOTP'))
				throw new AuthError({
					name: AuthErrorCodes.SignInException,
					message: `Cannot initiate MFA setup from available types: ${getMFATypes(
						parseMFATypes(challengeParameters.MFAS_CAN_SETUP)
					)}`,
				});
			const { Session, SecretCode: secretCode } = await associateSoftwareToken(
				{ region: getRegion(userPoolId) },
				{
					Session: signInSession,
				}
			);
			signInStore.dispatch({
				type: 'SET_SIGN_IN_SESSION',
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
					allowedMFATypes: getMFATypes(
						parseMFATypes(challengeParameters.MFAS_CAN_CHOOSE)
					),
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
	// TODO: remove this error message for production apps
	throw new AuthError({
		name: AuthErrorCodes.SignInException,
		message:
			'An error occurred during the sign in process. ' +
			`${challengeName} challengeName returned by the underlying service was not addressed.`,
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

			return new URL(totpUri);
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
	config: AuthConfig,
	clientMetadata?: ClientMetadata,
	options?: CognitoConfirmSignInOptions
): Promise<RespondToAuthChallengeCommandOutput> {
	const userAttributes = options?.userAttributes;
	const deviceName = options?.friendlyDeviceName;

	switch (challengeName) {
		case 'SMS_MFA':
			return handleSMSMFAChallenge({
				challengeResponse,
				clientMetadata,
				session,
				username,
				config,
			});
		case 'SELECT_MFA_TYPE':
			return handleSelectMFATypeChallenge({
				challengeResponse,
				clientMetadata,
				session,
				username,
				config,
			});
		case 'MFA_SETUP':
			return handleMFASetupChallenge({
				challengeResponse,
				clientMetadata,
				session,
				username,
				deviceName,
				config,
			});
		case 'NEW_PASSWORD_REQUIRED':
			return handleCompleteNewPasswordChallenge({
				challengeResponse,
				clientMetadata,
				session,
				username,
				requiredAttributes: userAttributes,
				config,
			});
		case 'CUSTOM_CHALLENGE':
			return handleCustomChallenge({
				challengeResponse,
				clientMetadata,
				session,
				username,
				config,
			});
		case 'SOFTWARE_TOKEN_MFA':
			return handleSoftwareTokenMFAChallenge({
				challengeResponse,
				clientMetadata,
				session,
				username,
				config,
			});
	}
	// TODO: remove this error message for production apps
	throw new AuthError({
		name: AuthErrorCodes.SignInException,
		message: `An error occurred during the sign in process. 
		${challengeName} challengeName returned by the underlying service was not addressed.`,
	});
}

export function mapMfaType(mfa: string): CognitoMFAType {
	let mfaType: CognitoMFAType = 'SMS_MFA';
	if (mfa === 'TOTP') mfaType = 'SOFTWARE_TOKEN_MFA';

	return mfaType;
}

export function getMFAType(type?: string): MFAType | undefined {
	if (type === 'SMS_MFA') return 'SMS';
	if (type === 'SOFTWARE_TOKEN_MFA') return 'TOTP';
	// TODO: log warning for unknown MFA type
}

export function getMFATypes(types?: string[]): MFAType[] | undefined {
	if (!types) return undefined;
	return types.map(getMFAType).filter(Boolean) as MFAType[];
}
export function parseMFATypes(mfa?: string): CognitoMFAType[] {
	if (!mfa) return [];
	return JSON.parse(mfa) as CognitoMFAType[];
}

export function isMFATypeEnabled(
	challengeParams: ChallengeParameters,
	mfaType: MFAType
): boolean {
	const { MFAS_CAN_SETUP } = challengeParams;
	const mfaTypes = getMFATypes(parseMFATypes(MFAS_CAN_SETUP));
	if (!mfaTypes) return false;
	return mfaTypes.includes(mfaType);
}
