import { createMachine, MachineConfig, EventFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { FederatedSignInMachineContext } from '../types/machines';
import { SOCIAL_PROVIDER } from '../../../types';

function bufferToString(buffer: Uint8Array) {
	const CHARSET =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const state = [];
	for (let i = 0; i < buffer.byteLength; i += 1) {
		const index = buffer[i] % CHARSET.length;
		state.push(CHARSET[index]);
	}
	return state.join('');
}

function generateRandom(size: number) {
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
	return bufferToString(buffer);
}

function generateState(length: number) {
	let result = '';
	let i = length;
	const chars =
		'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for (; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}

export interface FederatedSignInParams {
	responeType: 'code';
	domain: string;
	redirectSignIn: string;
	clientId: string;
	provider: SOCIAL_PROVIDER;
	customState?: string;
	oAuthStorage?: Storage;
}

async function sha256(str: string) {
	return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
}

async function generateChallenge(pkceKey: string) {
	const pkceKeyHash = await sha256(pkceKey);
	const pkceKeyHashStr = String.fromCharCode.apply(
		null,
		Array.from(new Uint8Array(pkceKeyHash))
	);
	return base64URLEncode(pkceKeyHashStr);
}

function base64URLEncode(str: string) {
	return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function oauthSignIn(
	context: FederatedSignInMachineContext,
	event: unknown
) {
	const {
		customState,
		oAuthStorage,
		scopes,
		authConfig,
		urlOpener = launchUri,
	} = context;
	const generatedState = generateState(32);
	oAuthStorage.setItem('oauth_state', generatedState);
	const pkceKey = generateRandom(128);
	console.log({ pkceKey });
	oAuthStorage.setItem('oauth_pkce_key', pkceKey);
	const codeChallenge = await generateChallenge(pkceKey);
	const codeChallengeMethod = 'S256';
	console.log(authConfig);
	console.log(JSON.stringify(context));
	if (!authConfig.oauth?.redirectSignIn) return Promise.reject('Cagamos');
	const queryString = Object.entries({
		redirect_uri: authConfig.oauth?.redirectSignIn,
		response_type: authConfig.oauth.responseType,
		// HARD CODED FOR NOW
		client_id: 'a8b9mhnhm74trgehjn8a9h518',
		identity_provider: context.oAuthProvider || 'COGNITO',
		scope: authConfig.oauth.scope.join(' '),
		state: generatedState,
		code_challenge: codeChallenge,
		code_challenge_method: codeChallengeMethod,
	})
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');
	const url = `https://${authConfig.oauth?.domain}/oauth2/authorize?${queryString}`;
	return urlOpener(url, authConfig.oauth.redirectSignIn);
}

function launchUri(url: string) {
	const windowProxy = window.open(url, '_self');
	if (windowProxy) {
		return Promise.resolve(windowProxy);
	} else {
		return Promise.reject();
	}
}

export const federatedSignInMachineModel = createModel(
	{
		scopes: [],
		oAuthStorage: window.sessionStorage,
		authConfig: {
			userPoolId: '',
			clientId: '',
			region: '',
		},
		urlOpener: launchUri,
	} as FederatedSignInMachineContext,
	{
		events: {},
	}
);

async function handleAuthResponse(context: FederatedSignInMachineContext) {
	const url = new URL(window.location.href);
	const urlParams: { [key: string]: any } = {};
	url.hash
		.substr(1)
		.split('&')
		.map(k => k.split('='))
		.forEach(([k, v]) => {
			urlParams[k] = v;
		});
	url.search
		.split('&')
		.map(k => k.split('='))
		.forEach(([k, v]) => {
			urlParams[k] = v;
		});
	console.log('handling auth response');
	if (context.authConfig.oauth?.responseType === 'code') {
		return await handleCodeFlow(context, url);
	}
}

async function handleCodeFlow(
	context: FederatedSignInMachineContext,
	url: URL
) {
	console.log('handle code flow');
	const { code } = url.search
		.substr(1)
		.split('&')
		.map(k => k.split('='))
		.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {
			code: undefined as undefined | string,
		});
	console.log({ code });
	const currentUrlPathname = url.pathname || '/';
	const redirectSignInPathname = context.authConfig.oauth?.redirectSignIn
		? new URL(context.authConfig.oauth?.redirectSignIn).pathname
		: '/';
	console.log({ currentUrlPathname });
	console.log({ redirectSignInPathname });
	if (!code || currentUrlPathname !== redirectSignInPathname) return;
	const oAuthTokenEndpoint = `https://${context.authConfig.oauth?.domain}/oauth2/token`;
	if (
		!window.sessionStorage.getItem('oauth_pkce_key') ||
		!context.authConfig.oauth?.redirectSignIn
	) {
		console.log('cancel');
		return;
	}
	if (!window.sessionStorage.getItem('oauth_pkce_key')) {
		throw new Error('no PKCE key');
	}
	const oAuthTokenBody = {
		grant_type: 'authorization_code',
		code,
		client_id: 'a8b9mhnhm74trgehjn8a9h518', // context.authConfig.clientId,
		redirect_uri: context.authConfig.oauth?.redirectSignIn,
		code_verifier: window.sessionStorage.getItem('oauth_pkce_key') as string,
	};
	const body = Object.entries(oAuthTokenBody)
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');

	const oAuthTokenRes = await fetchOAuthToken(oAuthTokenEndpoint, body);
	const json = await oAuthTokenRes.json();
	window.history.replaceState(null, '', '/');
	if (Object.prototype.hasOwnProperty.call(json, 'error')) {
		throw new Error(json.error);
	}
	return json;
}

function fetchOAuthToken(oAuthTokenEndpoint: string, body: string) {
	console.log('fetching oauth token');
	return fetch(oAuthTokenEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body,
	});
}

type FederatedSignInMachineEvents = EventFrom<
	typeof federatedSignInMachineModel
>;

export const federatedSignInMachineConfig: MachineConfig<
	FederatedSignInMachineContext,
	any,
	FederatedSignInMachineEvents
> = {
	id: 'federatedSignInMachine',
	initial: 'notStarted',
	context: federatedSignInMachineModel.initialContext,
	states: {
		notStarted: {
			onEntry: [
				(context, _event) => {
					console.log('Federated Sign In Machine spawned', context);
				},
			],
			always: [
				{
					cond: (context, event) => {
						const url = new URL(window.location.href);
						return url.search.substr(1).startsWith('code');
					},
					target: 'handleAuthResponse',
				},
				{
					target: 'redirect',
				},
			],
		},
		redirect: {
			onEntry: [
				(_context, _event) => {
					console.log('redirecting?');
				},
				(context, event) => {
					return oauthSignIn(context, event);
				},
			],
			invoke: {
				src: (context, event) => oauthSignIn(context, event),
				// it should just redirect, we dont need to do anything on done
				onDone: [],
				onError: 'error',
			},
		},
		handleAuthResponse: {
			invoke: {
				src: (context, event) => handleAuthResponse(context),
				onDone: [
					{
						target: 'done',
					},
					// (context, event) => {
					// 	console.log('handle auth response done');
					// 	return Promise.resolve();
					// },
				],
				onError: 'error',
			},
		},
		done: {
			type: 'final',
		},
		error: {
			type: 'final',
		},
	},
};

export const federatedSignInMachine = createMachine(
	federatedSignInMachineConfig
);
