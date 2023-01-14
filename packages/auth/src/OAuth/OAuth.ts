// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { launchUri } from './urlOpener';
import * as oAuthStorage from './oauthStorage';
import { Buffer } from 'buffer';

import {
	OAuthOpts,
	isCognitoHostedOpts,
	CognitoHostedUIIdentityProvider,
} from '../types/Auth';

import { ConsoleLogger as Logger, Hub, urlSafeEncode } from '@aws-amplify/core';

import { Sha256 } from '@aws-crypto/sha256-js';
const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const dispatchAuthEvent = (event: string, data: any, message: string) => {
	Hub.dispatch('auth', { event, data, message }, 'Auth', AMPLIFY_SYMBOL);
};

const logger = new Logger('OAuth');

export default class OAuth {
	private _urlOpener;
	private _config;
	private _cognitoClientId;
	private _scopes;

	constructor({
		config,
		cognitoClientId,
		scopes = [],
	}: {
		scopes: string[];
		config: OAuthOpts;
		cognitoClientId: string;
	}) {
		this._urlOpener = config.urlOpener || launchUri;
		this._config = config;
		this._cognitoClientId = cognitoClientId;

		if (!this.isValidScopes(scopes))
			throw Error('scopes must be a String Array');
		this._scopes = scopes;
	}

	private isValidScopes(scopes: string[]) {
		return (
			Array.isArray(scopes) && scopes.every(scope => typeof scope === 'string')
		);
	}

	public oauthSignIn(
		responseType = 'code',
		domain: string,
		redirectSignIn: string,
		clientId: string,
		provider:
			| CognitoHostedUIIdentityProvider
			| string = CognitoHostedUIIdentityProvider.Cognito,
		customState?: string
	) {
		const generatedState = this._generateState(32);

		/* encodeURIComponent is not URL safe, use urlSafeEncode instead. Cognito 
		single-encodes/decodes url on first sign in and double-encodes/decodes url
		when user already signed in. Using encodeURIComponent, Base32, Base64 add 
		characters % or = which on further encoding becomes unsafe. '=' create issue 
		for parsing query params. 
		Refer: https://github.com/aws-amplify/amplify-js/issues/5218 */
		const state = customState
			? `${generatedState}-${urlSafeEncode(customState)}`
			: generatedState;

		oAuthStorage.setState(state);

		const pkce_key = this._generateRandom(128);
		oAuthStorage.setPKCE(pkce_key);

		const code_challenge = this._generateChallenge(pkce_key);
		const code_challenge_method = 'S256';

		const scopesString = this._scopes.join(' ');

		const queryString = Object.entries({
			redirect_uri: redirectSignIn,
			response_type: responseType,
			client_id: clientId,
			identity_provider: provider,
			scope: scopesString,
			state,
			...(responseType === 'code' ? { code_challenge } : {}),
			...(responseType === 'code' ? { code_challenge_method } : {}),
		})
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join('&');

		const URL = `https://${domain}/oauth2/authorize?${queryString}`;
		logger.debug(`Redirecting to ${URL}`);
		this._urlOpener(URL, redirectSignIn);
	}

	private async _handleCodeFlow(currentUrl: string) {
		const urlObj = new URL(currentUrl);
		/* Convert URL into an object with parameters as keys
    { redirect_uri: 'http://localhost:3000/', response_type: 'code', ...} */
		const code = urlObj.searchParams.get('code');
		const currentUrlPathname = urlObj.pathname || '/';
		const redirectSignInPathname =
			new URL(this._config.redirectSignIn).pathname || '/';

		if (!code || currentUrlPathname !== redirectSignInPathname) {
			return;
		}

		const oAuthTokenEndpoint =
			'https://' + this._config.domain + '/oauth2/token';

		dispatchAuthEvent(
			'codeFlow',
			{},
			`Retrieving tokens from ${oAuthTokenEndpoint}`
		);

		const client_id = isCognitoHostedOpts(this._config)
			? this._cognitoClientId
			: this._config.clientID;

		const redirect_uri = isCognitoHostedOpts(this._config)
			? this._config.redirectSignIn
			: this._config.redirectUri;

		const code_verifier = oAuthStorage.getPKCE();

		const oAuthTokenBody = {
			grant_type: 'authorization_code',
			code,
			client_id,
			redirect_uri,
			...(code_verifier ? { code_verifier } : {}),
		};

		logger.debug(
			`Calling token endpoint: ${oAuthTokenEndpoint} with`,
			oAuthTokenBody
		);

		const body = Object.entries(oAuthTokenBody)
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join('&');

		const { access_token, refresh_token, id_token, error } = await (
			(await fetch(oAuthTokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body,
			})) as any
		).json();

		if (error) {
			throw new Error(error);
		}

		return {
			accessToken: access_token,
			refreshToken: refresh_token,
			idToken: id_token,
		};
	}

	private async _handleImplicitFlow(currentUrl: string) {
		// hash is `null` if `#` doesn't exist on URL
		const { id_token, access_token } = (new URL(currentUrl).hash || '#')
			.substr(1) // Remove # from returned code
			.split('&')
			.map(pairings => pairings.split('='))
			.reduce((accum, [k, v]) => ({ ...accum, [k]: v }), {
				id_token: undefined,
				access_token: undefined,
			});

		dispatchAuthEvent('implicitFlow', {}, `Got tokens from ${currentUrl}`);
		logger.debug(`Retrieving implicit tokens from ${currentUrl} with`);

		return {
			accessToken: access_token,
			idToken: id_token,
			refreshToken: null,
		};
	}

	public async handleAuthResponse(currentUrl?: string) {
		try {
			const urlObj = new URL(currentUrl || '');
			const urlParams = {
				error: urlObj.searchParams.get('error'),
				error_description: urlObj.searchParams.get('error_description') || '',
				state: urlObj.searchParams.get('state'),
			};
			const { error, error_description } = urlParams;

			if (error) {
				throw new Error(error_description);
			}

			const state: string = this._validateState(urlParams);

			logger.debug(
				`Starting ${this._config.responseType} flow with ${currentUrl}`
			);
			if (this._config.responseType === 'code') {
				return { ...(await this._handleCodeFlow(currentUrl || '')), state };
			} else {
				return { ...(await this._handleImplicitFlow(currentUrl || '')), state };
			}
		} catch (e) {
			logger.error(`Error handling auth response.`, e);
			throw e;
		}
	}

	private _validateState(urlParams: any): string {
		if (!urlParams) {
			return;
		}

		const savedState = oAuthStorage.getState();
		const { state: returnedState } = urlParams;

		// This is because savedState only exists if the flow was initiated by Amplify
		if (savedState && savedState !== returnedState) {
			throw new Error('Invalid state in OAuth flow');
		}
		return returnedState;
	}

	public async signOut() {
		let oAuthLogoutEndpoint = 'https://' + this._config.domain + '/logout?';

		const client_id = isCognitoHostedOpts(this._config)
			? this._cognitoClientId
			: this._config.oauth.clientID;

		const signout_uri = isCognitoHostedOpts(this._config)
			? this._config.redirectSignOut
			: this._config.returnTo;

		oAuthLogoutEndpoint += Object.entries({
			client_id,
			logout_uri: encodeURIComponent(signout_uri),
		})
			.map(([k, v]) => `${k}=${v}`)
			.join('&');

		dispatchAuthEvent(
			'oAuthSignOut',
			{ oAuth: 'signOut' },
			`Signing out from ${oAuthLogoutEndpoint}`
		);
		logger.debug(`Signing out from ${oAuthLogoutEndpoint}`);

		return this._urlOpener(oAuthLogoutEndpoint, signout_uri);
	}

	private _generateState(length: number) {
		let result = '';
		let i = length;
		const chars =
			'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		for (; i > 0; --i)
			result += chars[Math.round(Math.random() * (chars.length - 1))];
		return result;
	}

	private _generateChallenge(code: string) {
		const awsCryptoHash = new Sha256();
		awsCryptoHash.update(code);

		const resultFromAWSCrypto = awsCryptoHash.digestSync();
		const b64 = Buffer.from(resultFromAWSCrypto).toString('base64');
		const base64URLFromAWSCrypto = this._base64URL(b64);

		return base64URLFromAWSCrypto;
	}

	private _base64URL(string) {
		return string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
	}

	private _generateRandom(size: number) {
		const CHARSET =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
		const buffer = new Uint8Array(size);
		if (typeof window !== 'undefined' && !!window.crypto) {
			window.crypto.getRandomValues(buffer);
		} else {
			for (let i = 0; i < size; i += 1) {
				buffer[i] = (Math.random() * CHARSET.length) | 0;
			}
		}
		return this._bufferToString(buffer);
	}

	private _bufferToString(buffer: Uint8Array) {
		const CHARSET =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const state = [];
		for (let i = 0; i < buffer.byteLength; i += 1) {
			const index = buffer[i] % CHARSET.length;
			state.push(CHARSET[index]);
		}
		return state.join('');
	}
}
