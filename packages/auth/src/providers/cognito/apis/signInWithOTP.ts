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
import {
	AuthPasswordlessDeliveryDestination,
	AuthPasswordlessFlow,
	CognitoAuthSignInDetails,
} from '../types/models';
import { SignInWithOTPInput } from '../types/inputs';
import { SignInWithOTPOutput } from '../types/outputs';
import { setActiveSignInState } from '../utils/signInStore';

export const signInWithOTP = async <
	T extends AuthPasswordlessFlow = AuthPasswordlessFlow,
>(
	input: SignInWithOTPInput<T>
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
				authConfig as unknown as AuthConfig
			);
			// sets up local state used during the sign-in process
			setActiveSignInState({
				signInSession: Session,
				username,
				signInDetails,
			});

			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
					additionalInfo: ChallengeParameters as AuthAdditionalInfo,
					codeDeliveryDetails: {
						deliveryMedium:
							ChallengeParameters?.CODE_DELIVERY_DELIVERY_MEDIUM as AuthDeliveryMedium,
						destination: ChallengeParameters?.CODE_DELIVERY_DESTINATION,
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
	authConfig: AuthConfig
) {
	const { userPoolId, userPoolClientId } = authConfig.Cognito;
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

	const { Session } = await initiateAuth(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignIn),
		},
		jsonReqInitiateAuth
	);
	const jsonReqRespondToAuthChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'CUSTOM_CHALLENGE',
		ChallengeResponses: {
			USERNAME: username,
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
