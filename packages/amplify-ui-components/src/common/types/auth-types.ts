// TODO: Move these values to or extract them from the Cognito Provider in the Auth category for Auth V2

export enum AuthState {
	SignUp = 'signup',
	SignOut = 'signout',
	SignIn = 'signin',
	Loading = 'loading',
	SignedOut = 'signedout',
	SignedIn = 'signedin',
	SigningUp = 'signingup',
	ConfirmSignUp = 'confirmSignUp',
	confirmingSignUpCustomFlow = 'confirmsignupcustomflow',
	ConfirmSignIn = 'confirmSignIn',
	confirmingSignInCustomFlow = 'confirmingsignincustomflow',
	VerifyingAttributes = 'verifyingattributes',
	ForgotPassword = 'forgotpassword',
	ResetPassword = 'resettingpassword',
	SettingMFA = 'settingMFA',
	TOTPSetup = 'TOTPSetup',
	CustomConfirmSignIn = 'customConfirmSignIn',
	VerifyContact = 'verifyContact',
}

export interface FederatedConfig {
	auth0Config?: {
		audience?: string;
		clientID: string;
		domain: string;
		responseType: string;
		redirectUri: string;
		returnTo?: string;
		scope?: string;
	};
	amazonClientId?: string;
	facebookAppId?: string;
	googleClientId?: string;
	oauthConfig?: {
		[key: string]: any;
	};
}

export interface SignUpResponseInterface {
	codeDeliveryDetails?: {
		AttributeName?: string;
		DeliveryMedium?: string;
		Destination?: string;
	};
	user?: CognitoUserInterface;
	username?: string;
}

export interface CognitoUserInterface {
	Session?: string | null;
	authenticationFlowType?: string;
	client?: {
		endpoint?: string;
		userAgent?: string;
	};
	keyPrefix?: string;
	pool?: {
		advancedSecurityDataCollectionFlag?: boolean;
		clientId?: string;
		userPoolId?: string;
	};
	username?: string;
	userConfirmed?: boolean;
	userSub?: string;
	challengeName: string;
	challengeParam: { [key: string]: any };
	unverified?: {
		email?: string;
		phone_number?: string;
	};
	[attributes: string]: any;
}

export interface SignUpAttributes {
	username: string;
	password: string;
	attributes?: {
		[userAttributes: string]: string;
	};
}

export type AuthStateHandler = (
	nextAuthState: AuthState,
	data?: object
) => void;

export enum MfaOption {
	TOTP = 'TOTP',
	SMS = 'SMS',
	NOMFA = 'NOMFA',
}

export interface MFATypesInterface {
	TOTP?: boolean;
	SMS?: boolean;
	Optional?: boolean;
}

export enum ChallengeName {
	SoftwareTokenMFA = 'SOFTWARE_TOKEN_MFA',
	SMSMFA = 'SMS_MFA',
	NewPasswordRequired = 'NEW_PASSWORD_REQUIRED',
	MFASetup = 'MFA_SETUP',
	CustomChallenge = 'CUSTOM_CHALLENGE',
}

export enum AuthFormField {
	Password = 'password',
}

export enum UsernameAlias {
	username = 'username',
	email = 'email',
	phone_number = 'phone_number',
}

export type UsernameAliasStrings = keyof typeof UsernameAlias;
