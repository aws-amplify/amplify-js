import { Amplify, AuthConfig } from '@aws-amplify/core';
import { AuthAdditionalInfo, AuthDeliveryMedium } from '../../../types';
import {
	initiateAuth,
	respondToAuthChallenge,
} from '../utils/clients/CognitoIdentityProvider';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import {
	InitiateAuthCommandInput,
	RespondToAuthChallengeCommandInput,
} from '../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { getAuthUserAgentValue } from '../../../utils';
import { CognitoAuthSignInDetails } from '../types/models';
import { SignInWithOTPInput } from '../types/inputs';
import { SignInWithOTPOutput } from '../types/outputs';
import { setActiveSignInState } from '../utils/signInStore';
import {
	getActiveSignInUsername,
	setActiveSignInUsername,
} from '../utils/signInHelpers';

export const signInWithOTP = async (
	input: SignInWithOTPInput
): Promise<SignInWithOTPOutput> => {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { username, flow } = input;

	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername
	);

	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'CUSTOM_WITHOUT_SRP',
	};

	switch (flow) {
		case 'SIGN_IN':
			const { ChallengeParameters, Session } = await handlePasswordlessSignIn(
				input,
				authConfig as AuthConfig['Cognito']
			);
			// sets up local state used during the sign-in process
			setActiveSignInState({
				signInSession: Session,
				username: getActiveSignInUsername(username),
				signInDetails,
			});

			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
					additionalInfo: ChallengeParameters as AuthAdditionalInfo,
					codeDeliveryDetails: {
						deliveryMedium:
							ChallengeParameters?.deliveryMedium as AuthDeliveryMedium,
						destination: ChallengeParameters?.destination,
					},
				},
			};

		case 'SIGN_UP_AND_SIGN_IN':
			throw new Error('Not implemented');
	}

	throw new Error('Not implemented');
};

async function handlePasswordlessSignIn(
	input: SignInWithOTPInput,
	authConfig: AuthConfig['Cognito']
) {
	const { userPoolId, userPoolClientId } = authConfig;
	const { username, options, destination } = input;
	const { clientMetadata } = options ?? {};
	const authParameters: Record<string, string> = {
		USERNAME: username,
	};

	const jsonReqInitiateAuth: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: authParameters,
		ClientId: userPoolClientId,
	};

	const { Session, ChallengeParameters } = await initiateAuth(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignIn),
		},
		jsonReqInitiateAuth
	);
	const activeUsername = ChallengeParameters?.USERNAME ?? username;

	setActiveSignInUsername(activeUsername);

	// The answer is not used by the service. It is just a placeholder to make the request happy.
	const dummyAnswer = 'dummyAnswer';
	const jsonReqRespondToAuthChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'CUSTOM_CHALLENGE',
		ChallengeResponses: {
			USERNAME: activeUsername,
			ANSWER: dummyAnswer,
		},
		Session,
		ClientMetadata: {
			...clientMetadata,
			signInMethod: 'OTP',
			deliveryMedium: getDeliveryMedium(destination),
			action: 'REQUEST',
		},
		ClientId: userPoolClientId,
	};

	return await respondToAuthChallenge(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		jsonReqRespondToAuthChallenge
	);
}

function getDeliveryMedium(destination: AuthPasswordlessDeliveryDestination) {
	const deliveryMediumMap: Record<AuthPasswordlessDeliveryDestination, string> =
		{
			EMAIL: 'EMAIL',
			PHONE: 'SMS',
		};
	return deliveryMediumMap[destination];
}
