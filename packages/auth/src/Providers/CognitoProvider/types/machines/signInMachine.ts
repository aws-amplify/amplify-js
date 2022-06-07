import {
	CognitoIdentityProviderClientConfig,
	AuthFlowType,
	ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';
import { EventObject } from 'xstate';
import { CognitoService } from '../../serviceClass';
import { CognitoProviderConfig } from '../../CognitoProvider';
import { SignInParams, SOCIAL_PROVIDER } from '../../../../types';

export type SignInMachineContext = BaseSignInMachineContext &
	(UserPasswordSignInContext | SocialSignInContext | SRPSignInContext);

export type SignInRequestEventParam = BaseSignInRequestEventParam &
	(UserPasswordSignInEventParam | FederatedSignInEventParam);

type UserPasswordSignInEventParam = {
	signInFlow: AuthFlowType.USER_PASSWORD_AUTH;
	password: string;
};

type FederatedSignInEventParam = {
	signInFlow: 'federated';
	provider: SOCIAL_PROVIDER;
};

type BaseSignInRequestEventParam = SignInParams & {
	password?: string;
};

type BaseSignInMachineContext = {
	// NOTE: Could also just pass down the client directly
	clientConfig: CognitoIdentityProviderClientConfig;
	authConfig: CognitoProviderConfig;
	service: CognitoService | null;
	authFlow?: AuthFlowType | 'federated';
	error?: any;
	session?: string;
	userStorage?: Storage;
};

type SRPSignInContext = {
	authFlow: AuthFlowType.USER_SRP_AUTH;
	username: string;
	password: string;
};

type UserPasswordSignInContext = {
	authFlow: AuthFlowType.USER_PASSWORD_AUTH;
	username: string;
	password: string;
};

type SocialSignInContext = {
	authFlow: 'federated';
	oAuthProvider?: SOCIAL_PROVIDER;
};

export function assertUserPasswordSignInContext(
	context: SignInMachineContext
): asserts context is BaseSignInMachineContext & UserPasswordSignInContext {
	if (context.authFlow !== AuthFlowType.USER_PASSWORD_AUTH)
		throw new Error('context is not for Plain User Password Sign In.');
}

export function assertSocialSignInContext(
	context: SignInMachineContext
): asserts context is BaseSignInMachineContext & SocialSignInContext {
	if (context.authFlow !== 'federated') {
		throw new Error('context is not for federated sign in.');
	}
}

export type SignInMachineTypestate =
	| { value: 'notStarted'; context: SignInMachineContext }
	| {
			value: 'initiatingPlainUsernamePasswordSignIn';
			context: SignInMachineContext;
	  }
	| { value: 'nextAuthChallenge'; context: SignInMachineContext }
	| {
			value: 'signedIn';
			context: SignInMachineContext;
	  }
	| {
			value: 'error';
			context: SignInMachineContext & { error: any };
	  }
	| { value: 'initiatingSRPA'; context: SignInMachineContext }
	| {
			value: 'respondingToAuthChallenge';
			context: SignInMachineContext & { session: string };
	  };

export type RespondToAuthEventOptions = (
	| RespondToMFAChallengeOptions
	| RespondToCompleteNewPasswordChallengeOptions
) & { clientMetadata?: Record<string, any> };

export type RespondToMFAChallengeOptions = {
	challengeName:
		| ChallengeNameType.SMS_MFA
		| ChallengeNameType.SOFTWARE_TOKEN_MFA;
	confirmationCode: string;
};

export type RespondToCompleteNewPasswordChallengeOptions = {
	challengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED;
	newPassword: string;
	requiredAttributes?: Record<string, any>;
};

export type AuthenticationFlows = AuthFlowType | 'OAuth';

export function assertEventType<
	TE extends EventObject,
	TType extends TE['type']
>(event: TE, eventType: TType): asserts event is TE & { type: TType } {
	if (event.type !== eventType) {
		throw new Error(
			`Invalid event: expected "${eventType}", got "${event.type}"`
		);
	}
}
