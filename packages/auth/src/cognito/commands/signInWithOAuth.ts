import { Amplify, parseAWSExports, StorageHelper } from '@aws-amplify/core';
import OAuth from '../../OAuth/OAuth';
import {
	OAuthOpts,
	AwsCognitoOAuthOpts,
	CognitoHostedUIIdentityProvider,
} from '../../types';
export function isCognitoHostedOpts(
	oauth: OAuthOpts
): oauth is AwsCognitoOAuthOpts {
	return (<AwsCognitoOAuthOpts>oauth).redirectSignIn !== undefined;
}

export function signInWithOAuth() {
	debugger;
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	if (amplifyConfig && amplifyConfig.Auth) {
		console.log('hostedUI redirect...');
		const {
			userPoolId,
			userPoolWebClientId,
			cookieStorage,
			region,
			identityPoolId,
			mandatorySignIn,
			refreshHandlers,
			identityPoolRegion,
			clientMetadata,
			endpoint,
		} = amplifyConfig.Auth as any;
		const { oauth } = Amplify.getConfig();
		const cognitoHostedUIConfig = oauth
			? isCognitoHostedOpts(oauth)
				? oauth
				: (<any>oauth).awsCognito
			: undefined;

		const cognitoAuthParams = Object.assign(
			{
				cognitoClientId: userPoolWebClientId,
				UserPoolId: userPoolId,
				domain: cognitoHostedUIConfig['domain'],
				scopes: cognitoHostedUIConfig['scope'],
				redirectSignIn: cognitoHostedUIConfig['redirectSignIn'],
				redirectSignOut: cognitoHostedUIConfig['redirectSignOut'],
				responseType: cognitoHostedUIConfig['responseType'],
				Storage: new StorageHelper().getStorage(),
				urlOpener: cognitoHostedUIConfig['urlOpener'],
				clientMetadata,
			},
			cognitoHostedUIConfig['options']
		);
		const _oAuthHandler = new OAuth({
			scopes: cognitoAuthParams.scopes,
			config: cognitoAuthParams,
			cognitoClientId: cognitoAuthParams.cognitoClientId,
		});
		const client_id = isCognitoHostedOpts(oauth)
			? amplifyConfig.Auth.userPoolWebClientId
			: oauth.clientID;
		/*Note: Invenstigate automatically adding trailing slash */
		const redirect_uri = isCognitoHostedOpts(oauth)
			? oauth.redirectSignIn
			: oauth.redirectUri;

		_oAuthHandler.oauthSignIn(
			oauth.responseType,
			oauth.domain,
			redirect_uri,
			client_id,
			CognitoHostedUIIdentityProvider.Cognito
		);
		return;
	}

	console.log('no config....');
}
