// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

import { CognitoAuthSignInDetails } from '../types';

import { SyncKeyValueStorage } from './storage';
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
const EXPIRATION_MINUTES = 3;
const MS_TO_EXPIRY = 1000 * 60 * EXPIRATION_MINUTES;
const SIGN_IN_STATE_KEYS: Record<string, string> = {
	username: 'CognitoSignInState.username',
	challengeName: 'CognitoSignInState.challengeName',
	signInSession: 'CognitoSignInState.signInSession',
	expiry: 'CognitoSignInState.expiry',
};

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
			return setInitialState();
		default:
			return state;
	}
};

const isExpired = (expiryDate: string): boolean => {
	const expiryTimestamp = Number(expiryDate);
	const currentTimestamp = Date.now();

	return expiryTimestamp <= currentTimestamp;
};

const clearPersistedSignInState = (keys: Record<string, string>) => {
	for (const key in keys) {
		syncedSessionStorage.removeItem(key);
	}
};

const getDefaultState = (): SignInState => ({
	username: undefined,
	challengeName: undefined,
	signInSession: undefined,
});

// Hydrate signInStore from Synced Session Storage
const setInitialState = (): SignInState => {
	const expiry = syncedSessionStorage.getItem(
		SIGN_IN_STATE_KEYS.expiry,
	) as string;
	if (isExpired(expiry)) {
		logger.warn('Sign-in session expired');
		clearPersistedSignInState(SIGN_IN_STATE_KEYS);

		return getDefaultState();
	}

	const username =
		syncedSessionStorage.getItem(SIGN_IN_STATE_KEYS.username) ?? undefined;
	const challengeName = (syncedSessionStorage.getItem(
		SIGN_IN_STATE_KEYS.challengeName,
	) ?? '') as ChallengeName;
	const signInSession =
		syncedSessionStorage.getItem(SIGN_IN_STATE_KEYS.signInSession) ?? undefined;

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

// Synchronous Session Storage
export const syncedSessionStorage = new SyncKeyValueStorage(
	window.sessionStorage,
);

export const signInStore = createStore(signInReducer);

export function setActiveSignInState(state: SignInState): void {
	signInStore.dispatch({
		type: 'SET_SIGN_IN_STATE',
		value: state,
	});

	// Save the local state into Synced Session Storage
	persistSignInState(state);
}

// Clear saved sign in states from both memory and Synced Session Storage
export function cleanActiveSignInState(): void {
	signInStore.dispatch({ type: 'SET_INITIAL_STATE' });
	clearPersistedSignInState(SIGN_IN_STATE_KEYS);
}

const persistSignInState = ({
	challengeName = '' as ChallengeName,
	signInSession = '',
	username = '',
}: SignInState) => {
	syncedSessionStorage.setItem(SIGN_IN_STATE_KEYS.username, username);
	syncedSessionStorage.setItem(SIGN_IN_STATE_KEYS.challengeName, challengeName);
	syncedSessionStorage.setItem(SIGN_IN_STATE_KEYS.signInSession, signInSession);
	syncedSessionStorage.setItem(
		SIGN_IN_STATE_KEYS.expiry,
		String(Date.now() + MS_TO_EXPIRY),
	);
};
