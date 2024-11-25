// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
	| { type: 'SET_SIGN_IN_SESSION'; value?: string };

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
			return defaultState();
		default:
			return state;
	}
};

function defaultState(): SignInState {
	return {
		username: undefined,
		challengeName: undefined,
		signInSession: undefined,
	};
}

const createStore: Store<SignInState, SignInAction> = reducer => {
	let currentState = reducer(defaultState(), { type: 'SET_INITIAL_STATE' });

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

export function cleanActiveSignInState(): void {
	signInStore.dispatch({ type: 'SET_INITIAL_STATE' });
}
