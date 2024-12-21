// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { syncSessionStorage } from '@aws-amplify/core';

import { CognitoAuthSignInDetails } from '../../../providers/cognito/types';
import { ChallengeName } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { Reducer, Store } from './types';

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
	| { type: 'SET_SIGN_IN_SESSION'; value?: string }
	| { type: 'RESET_STATE' };

// Minutes until stored session invalidates is defaulted to 3 minutes
// to maintain parity with Amazon Cognito user pools API behavior
const MS_TO_EXPIRY = 3 * 60 * 1000;
const TGT_STATE = 'CognitoSignInState';
const SIGN_IN_STATE_KEYS = {
	username: `${TGT_STATE}.username`,
	challengeName: `${TGT_STATE}.challengeName`,
	signInSession: `${TGT_STATE}.signInSession`,
	expiry: `${TGT_STATE}.expiry`,
};

const signInReducer: Reducer<SignInState, SignInAction> = (state, action) => {
	switch (action.type) {
		case 'SET_SIGN_IN_SESSION':
			persistSignInState({ signInSession: action.value });

			return {
				...state,
				signInSession: action.value,
			};

		case 'SET_SIGN_IN_STATE':
			persistSignInState(action.value);

			return {
				...action.value,
			};

		case 'SET_CHALLENGE_NAME':
			persistSignInState({ challengeName: action.value });

			return {
				...state,
				challengeName: action.value,
			};

		case 'SET_USERNAME':
			persistSignInState({ username: action.value });

			return {
				...state,
				username: action.value,
			};

		case 'SET_INITIAL_STATE':
			return getInitialState();

		case 'RESET_STATE':
			clearPersistedSignInState();

			return getDefaultState();

		// this state is never reachable
		default:
			return state;
	}
};

const isExpired = (expiryDate: string | null): boolean => {
	const expiryTimestamp = Number(expiryDate);
	const currentTimestamp = Date.now();

	return expiryTimestamp <= currentTimestamp;
};

export const resetActiveSignInState = () => {
	signInStore.dispatch({ type: 'RESET_STATE' });
};

const clearPersistedSignInState = () => {
	for (const stateKey of Object.values(SIGN_IN_STATE_KEYS)) {
		syncSessionStorage.removeItem(stateKey);
	}
};

const getDefaultState = (): SignInState => ({
	username: undefined,
	challengeName: undefined,
	signInSession: undefined,
});

// Hydrate signInStore from syncSessionStorage if the session has not expired
const getInitialState = (): SignInState => {
	const expiry = syncSessionStorage.getItem(SIGN_IN_STATE_KEYS.expiry);

	if (!expiry || isExpired(expiry)) {
		clearPersistedSignInState();

		return getDefaultState();
	}
	const username =
		syncSessionStorage.getItem(SIGN_IN_STATE_KEYS.username) ?? undefined;

	const challengeName = (syncSessionStorage.getItem(
		SIGN_IN_STATE_KEYS.challengeName,
	) ?? undefined) as ChallengeName;
	const signInSession =
		syncSessionStorage.getItem(SIGN_IN_STATE_KEYS.signInSession) ?? undefined;

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
}

// Save local state into Session Storage
export const persistSignInState = ({
	challengeName,
	signInSession,
	username,
}: SignInState) => {
	username && syncSessionStorage.setItem(SIGN_IN_STATE_KEYS.username, username);
	challengeName &&
		syncSessionStorage.setItem(SIGN_IN_STATE_KEYS.challengeName, challengeName);

	if (signInSession) {
		syncSessionStorage.setItem(SIGN_IN_STATE_KEYS.signInSession, signInSession);

		// Updates expiry when session is passed
		syncSessionStorage.setItem(
			SIGN_IN_STATE_KEYS.expiry,
			String(Date.now() + MS_TO_EXPIRY),
		);
	}
};
