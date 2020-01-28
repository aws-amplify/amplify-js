import AuthClass, { CognitoHostedUIIdentityProvider } from './Auth';
import { CognitoUser, CookieStorage } from 'amazon-cognito-identity-js';
declare const Auth: AuthClass;
export default Auth;
export {
	AuthClass,
	CognitoUser,
	CookieStorage,
	CognitoHostedUIIdentityProvider,
};
