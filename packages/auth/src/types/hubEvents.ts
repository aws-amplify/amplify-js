import { AuthError } from "../Errors";
import { AuthSignInResult, AuthSignUpResult, AuthUserAttribute, AuthUserAttributeKey, ResetPasswordResult, SignOutResult } from "./AmazonCognitoProvider";


export const enum AuthHubEvent {
	SIGN_IN = "SIGN_IN",
	SIGN_IN_FAILURE = "SIGN_IN_FAILURE",
	SIGN_UP = "SIGN_UP",
	SIGN_UP_FAILURE = "SIGN_UP_FAILURE",
	CONFIRM_SIGN_UP = "CONFIRM_SIGN_UP",
	SIGN_OUT = "SIGN_OUT",
	TOKEN_REFRESH = "TOKEN_REFRESH",
	TOKEN_REFRESH_FAILURE = "TOKEN_REFRESH_FAILURE",
	AUTO_SIGN_IN = "AUTO_SIGN_IN",
	AUTO_SIGN_IN_FAILURE = "AUTO_SIGN_IN_FAILURE",
	CONFIGURED = "CONFIGURED",
	COMPLETE_NEW_PASSWORD_FAILURE = "COMPLETE_NEW_PASSWORD_FAILURE",
	DELETE_USER = "DELETE_USER",
	FORGOT_PASSWORD = "FORGOT_PASSWORD",
	FORGOT_PASSWORD_FAILURE = "FORGOT_PASSWORD_FAILURE",
	FORGOT_PASSWORD_SUBMIT = "FORGOT_PASSWORD_SUBMIT",
	FORGOT_PASSWORD_SUBMIT_FAILURE = "FORGOT_PASSWORD_SUBMIT_FAILURE",
	PARSING_CALLBACK_URL = "PARSING_CALLBACK_URL",
	COGNITO_HOSTED_UI = "COGNITO_HOSTED_UI",
	COGNITO_HOSTED_UI_FAILURE = "COGNITO_HOSTED_UI_FAILURE",
	CUSTOM_OAUTH_STATE = "CUSTOM_OAUTH_STATE",
	CUSTOM_OAUTH_STATE_FAILURE = "CUSTOM_OAUTH_STATE_FAILURE",
  }
  
  
  
  export type AuthEventPayloadMap<UserAttributeKey extends AuthUserAttributeKey> = {
	[AuthHubEvent.SIGN_IN]: {
	  data: {response: AuthSignInResult<UserAttributeKey>, user: {}};
	  message: `A user ${string} has been signed in`;
	};
	[AuthHubEvent.SIGN_IN_FAILURE]: {
	  data: AuthError;
	  message: `${string} failed to sign-in`;
	};
	[AuthHubEvent.SIGN_UP]: {
	  data: {response: AuthSignUpResult<UserAttributeKey>, user:null};
	  message: `${string} has signed up successfully`;
	};
	[AuthHubEvent.SIGN_UP_FAILURE]: {
	  data: AuthError;
	  message: `${string} failed to sign-up`;
	};
	[AuthHubEvent.CONFIRM_SIGN_UP]: {
	  data: AuthSignUpResult<UserAttributeKey>;
	  message: `${string} has been confirmed successfully`;
	};
	[AuthHubEvent.SIGN_OUT]: {
	  data: SignOutResult;
	  message: `A user has been signed out`;
	};
	[AuthHubEvent.TOKEN_REFRESH]: {
	  data: undefined;
	  message: `New token retrieved`;
	};
	[AuthHubEvent.TOKEN_REFRESH_FAILURE]: {
	  data: AuthError;
	  message: `Failed to retrieve new token`;
	};
	[AuthHubEvent.AUTO_SIGN_IN]: {
	  data: {response: AuthSignInResult<UserAttributeKey>, user:null};
	  message: `${string} has signed in successfully`;
	};
	[AuthHubEvent.AUTO_SIGN_IN_FAILURE]: {
	  data: AuthError;
	  message: "autoSignIn has failed";
	};
	[AuthHubEvent.CONFIGURED]: {
	  data: null;
	  message: `The Auth category has been configured successfully`;
	};
	[AuthHubEvent.COMPLETE_NEW_PASSWORD_FAILURE]: {
	  data: AuthError;
	  message: `${string} failed to complete the new password flow`;
	};
	[AuthHubEvent.DELETE_USER]: {
	  data: null;
	  message: `The authenticated user has been deleted.`;
	};
	[AuthHubEvent.FORGOT_PASSWORD]: {
	  data: ResetPasswordResult;
	  message: `${string} has initiated forgot password flow`;
	};
	[AuthHubEvent.FORGOT_PASSWORD_FAILURE]: {
	  data: AuthError;
	  message: `${string} forgotPassword failed`;
	};
	[AuthHubEvent.FORGOT_PASSWORD_SUBMIT]: {
	  data: null;
	  message: `${string} forgotPasswordSubmit successful`;
	};
	[AuthHubEvent.FORGOT_PASSWORD_SUBMIT_FAILURE]: {
	  data: AuthError;
	  message: `${string} forgotPasswordSubmit failed`;
	};
	[AuthHubEvent.PARSING_CALLBACK_URL]: {
	  data: { url: string };
	  message: `The callback url is being parsed`;
	};
	[AuthHubEvent.COGNITO_HOSTED_UI]: {
	  data: AuthSignInResult<UserAttributeKey>;
	  message: `A user ${string} has been signed in via Cognito Hosted UI`;
	};
	[AuthHubEvent.CUSTOM_OAUTH_STATE]:{
	  data: string,
	  message: `State for user ${string}`
	},
	[AuthHubEvent.COGNITO_HOSTED_UI_FAILURE]:{
	  data: AuthError,
	  message: `A failure occurred when returning to the Cognito Hosted UI`
	},
	[AuthHubEvent.CUSTOM_OAUTH_STATE_FAILURE]:{
	  data: AuthError,
	  message: "A failure occurred when returning state"
	}
  };