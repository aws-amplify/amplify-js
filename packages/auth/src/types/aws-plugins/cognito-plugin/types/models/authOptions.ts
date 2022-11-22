import { ICognitoStorage, ICookieStorageData } from ".";

export type AuthOptions = {
	userPoolId?: string;
	userPoolWebClientId?: string;
	identityPoolId?: string;
	region?: string;
	mandatorySignIn?: boolean;
	cookieStorage?: ICookieStorageData;
	oauth?: any;
	refreshHandlers?: object;
	storage?: ICognitoStorage;
	authenticationFlowType?: string;
	identityPoolRegion?: string;
	clientMetaData?: any;
	endpoint?: string;
	signUpVerificationMethod?: 'code' | 'link';
}