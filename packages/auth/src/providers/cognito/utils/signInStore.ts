// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

import { CognitoAuthSignInDetails } from '../types';

import { ChallengeName } from './clients/CognitoIdentityProvider/types';

// TODO: replace all of this implementation with state machines
interface SignInState {
	username?: string;
	challengeName?: ChallengeName;
	signInSession?: string;
	signInDetails?: CognitoAuthSignInDetails;
}

type SignInAction =
	| { type: 'SET_INITIAL_STATE' }
	| { type: 'SET_SIGN_IN_STATE'; value: SignInState }
	| { type: 'SET_USERNAME'; value?: string }
	| { type: 'SET_CHALLENGE_NAME'; value?: ChallengeName }
	| { type: 'SET_SIGN_IN_SESSION'; value?: string };

type Store<State, Action> = (reducer: Reducer<State, Action>) => {
	getState(): ReturnType<Reducer<State, Action>>;
	dispatch(action: Action): void;
};

type Reducer<State, Action> = (state: State, action: Action) => State;

const logger = new ConsoleLogger('Auth signInStore');

// Minutes until stored session invalidates
const EXPIRATION_MINUTES = 5;
const MS_TO_EXPIRY = 1000 * 60 * EXPIRATION_MINUTES;
const SIGN_IN_STATE_KEYS = [
	'username',
	'challengeName',
	'signInSession',
	'expiry',
].reduce((keys: Record<string, string>, key) => {
	keys[key] = `CognitoSignInState.${key}`;

	return keys;
}, {});

const signInReducer: Reducer<SignInState, SignInAction> = (state, action) => {
	switch (action.type) {
		case 'SET_SIGN_IN_SESSION':
			return {
				...state,
				signInSession: action.value,
			};
		case 'SET_SIGN_IN_STATE':
			return {
				...action.value,
			};
		case 'SET_CHALLENGE_NAME':
			return {
				...state,
				challengeName: action.value,
			};
		case 'SET_USERNAME':
			return {
				...state,
				username: action.value,
			};
		case 'SET_INITIAL_STATE':
			return getInitialState();
		default:
			return state;
	}
};

const isExpired = (expiryDate: string): boolean => {
	const expiryTimestamp = Number(expiryDate);
	const currentTimestamp = Date.now();

	return expiryTimestamp <= currentTimestamp;
};

const clearPersistedSignInState = () => {
	for (const key in SIGN_IN_STATE_KEYS) {
		sessionStorage.removeItem(key);
	}
};

const getDefaultState = (): SignInState => ({
	username: undefined,
	challengeName: undefined,
	signInSession: undefined,
});

// Hydrate signInStore from sessionStorage
const getInitialState = (): SignInState => {
	const expiry = sessionStorage.getItem(SIGN_IN_STATE_KEYS.expiry) as string;
	if (isExpired(expiry)) {
		logger.warn('Sign-in session expired');
		clearPersistedSignInState();

		return getDefaultState();
	}

	const username =
		sessionStorage.getItem(SIGN_IN_STATE_KEYS.username) ?? ('' as string);
	const challengeName = (sessionStorage.getItem(
		SIGN_IN_STATE_KEYS.challengeName,
	) ?? '') as ChallengeName;
	const signInSession =
		sessionStorage.getItem(SIGN_IN_STATE_KEYS.signInSession) ?? ('' as string);

	return {
		username,
		challengeName,
		signInSession,
	};
};

const createStore: Store<SignInState, SignInAction> = reducer => {
	let currentState = reducer(getDefaultState(), { type: 'SET_INITIAL_STATE' });

	return {
		getState: () => currentState,
		dispatch: action => {
			currentState = reducer(currentState, action);
		},
	};
};

export const signInStore = createStore(signInReducer);

export function setActiveSignInState(state: SignInState): void {
	signInStore.dispatch({
		type: 'SET_SIGN_IN_STATE',
		value: state,
	});

	// Save the local state into sessionStorage
	persistSignInState(state);
}

// Free saved sign in states up from both memory and sessionStorage
export function cleanActiveSignInState(): void {
	signInStore.dispatch({ type: 'SET_INITIAL_STATE' });
	clearPersistedSignInState();
}

const persistSignInState = ({
	challengeName = '' as ChallengeName,
	signInSession = '',
	username = '',
}: SignInState) => {
	sessionStorage.setItem(SIGN_IN_STATE_KEYS.username, username);
	sessionStorage.setItem(SIGN_IN_STATE_KEYS.challengeName, challengeName);
	sessionStorage.setItem(SIGN_IN_STATE_KEYS.signInSession, signInSession);
	sessionStorage.setItem(
		SIGN_IN_STATE_KEYS.expiry,
		String(Date.now() + MS_TO_EXPIRY),
	);
};
