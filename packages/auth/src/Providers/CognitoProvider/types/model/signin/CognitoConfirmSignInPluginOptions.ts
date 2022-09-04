import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';
import { ConfirmSignInPluginOptions } from 'src/types/model/signin/ConfirmSignInPluginOptions';

export type CognitoConfirmSignInPluginOptions = ConfirmSignInPluginOptions & {
	challengeName:
		| ChallengeNameType.SMS_MFA
		| ChallengeNameType.SOFTWARE_TOKEN_MFA
		| ChallengeNameType.NEW_PASSWORD_REQUIRED;
	// challengeName: ChallengeNameType;
	// default to SMS_MFA
	mfaType?: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA';
	clientMetadata?: { [key: string]: string };
};
