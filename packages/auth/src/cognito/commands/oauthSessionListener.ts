import { Amplify, parseAWSExports, StorageHelper } from '@aws-amplify/core';
import { parse } from 'url';
import OAuth from '../../OAuth/OAuth';
import { AwsCognitoOAuthOpts, isCognitoHostedOpts } from '../../types';
import { cacheTokens } from '../storage';

export async function oauthSessionListener() {
	const URL = window.location.href;
	const _storage = new StorageHelper().getStorage();

	console.log('listening for url', URL);
	// if (this.oAuthFlowInProgress) {
	// 	console.info(`Skipping URL ${URL} current flow in progress`);
	// 	return;
	// }

	try {
		// this.oAuthFlowInProgress = true;

		const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
		if (amplifyConfig && amplifyConfig.Auth) {
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

			if (!userPoolId) {
				return;
			}

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

			const currentUrl = URL || '';

			const hasCodeOrError = !!(parse(currentUrl).query || '')
				.split('&')
				.map(entry => entry.split('='))
				.find(([k]) => k === 'code' || k === 'error');

			const hasTokenOrError = !!(parse(currentUrl).hash || '#')
				.substr(1)
				.split('&')
				.map(entry => entry.split('='))
				.find(([k]) => k === 'access_token' || k === 'error');

			if (hasCodeOrError || hasTokenOrError) {
				_storage.setItem('amplify-redirected-from-hosted-ui', 'true');
				try {
					const { accessToken, idToken, refreshToken, state } =
						(await _oAuthHandler.handleAuthResponse(currentUrl)) as any;
					cacheTokens({
						accessToken,
						idToken,
						refreshToken,
						clockDrift: 0,
						username: 'username',
						userPoolClientID: userPoolWebClientId,
					});
					/*
				Prior to the request we do sign the custom state along with the state we set. This check will verify
				if there is a dash indicated when setting custom state from the request. If a dash is contained
				then there is custom state present on the state string.
				*/
					const isCustomStateIncluded = /-/.test(state);

					/*
				The following is to create a user for the Cognito Identity SDK to store the tokens
				When we remove this SDK later that logic will have to be centralized in our new version
				*/
					//#region

					// This calls cacheTokens() in Cognito SDK
					if (window && typeof window.history !== 'undefined') {
						window.history.replaceState(
							{},
							null,
							(oauth as AwsCognitoOAuthOpts).redirectSignIn
						);
					}

					if (isCustomStateIncluded) {
						const customState = state.split('-').splice(1).join('-');
					}
					//#endregion
					Amplify.setUser({
						accessToken,
						idToken,
						refreshToken,
					});
					return;
				} catch (err) {
					console.warn('Error in cognito hosted auth response', err);

					// Just like a successful handling of `?code`, replace the window history to "dispose" of the `code`.
					// Otherwise, reloading the page will throw errors as the `code` has already been spent.
					if (window && typeof window.history !== 'undefined') {
						window.history.replaceState(
							{},
							null,
							(oauth as AwsCognitoOAuthOpts).redirectSignIn
						);
					}
				}
			}
		}
	} finally {
		// this.oAuthFlowInProgress = false;
	}
}
