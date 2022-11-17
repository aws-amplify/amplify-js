import { ChallengeNameType, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { AuthOptions, AuthSignInStep } from "../types/AmazonCognitoProvider";


export const createCognitoIdentityProviderClient = (
	config: AuthOptions
): CognitoIdentityProviderClient => {
	const client = new CognitoIdentityProviderClient({region: config.region});
	return client;
}

export const mapChallengeNames = (challengeNameType: string): AuthSignInStep => {
	switch(challengeNameType) {
		// case ChallengeNameType.ADMIN_NO_SRP_AUTH:
		case ChallengeNameType.CUSTOM_CHALLENGE:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE;
		// case ChallengeNameType.DEVICE_PASSWORD_VERIFIER:
		// case ChallengeNameType.DEVICE_SRP_AUTH:
		// case ChallengeNameType.MFA_SETUP:
		case ChallengeNameType.NEW_PASSWORD_REQUIRED:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED;
		// case ChallengeNameType.PASSWORD_VERIFIER:
		case ChallengeNameType.SELECT_MFA_TYPE:
			return AuthSignInStep.SELECT_MFA_TYPE;
		case ChallengeNameType.SMS_MFA:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE;
		case ChallengeNameType.SOFTWARE_TOKEN_MFA:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE;
		default:
			return AuthSignInStep.DONE;
	}
}
