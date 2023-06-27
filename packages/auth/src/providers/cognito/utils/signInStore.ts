// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChallengeName } from './clients/types/models';

// TODO: replace all of this implementation with state machines
type SignInState = {
	username: string | undefined;
	activeChallengeName: string | undefined;
	activeSignInSession: string | undefined;
};

type SignInAction =
	| { type: 'SET_INITIAL_STATE' }
	| { type: 'SET_USERNAME'; value: string | undefined }
	| { type: 'SET_ACTIVE_CHALLENGE_NAME'; value: ChallengeName | undefined }
	| { type: 'SET_ACTIVE_SIGN_IN_SESSION'; value: string | undefined };

type Store<State, Action> = (reducer: Reducer<State, Action>) => {
	getState: () => ReturnType<Reducer<State, Action>>;
	dispatch(action: Action): void;
};

type Reducer<State, Action> = (state: State, action: Action) => State;

export const signInReducer: Reducer<SignInState, SignInAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'SET_ACTIVE_SIGN_IN_SESSION':
			return {
				...state,
				activeSignInSession: action.value,
			};
		case 'SET_ACTIVE_CHALLENGE_NAME':
			return {
				...state,
				activeChallengeName: action.value,
			};
		case 'SET_USERNAME':
			return {
				...state,
				username: action.value,
			};
		case 'SET_INITIAL_STATE':
			return {
				activeSignInSession: undefined,
				username: undefined,
				activeChallengeName: undefined,
			};
		default:
			return state;
	}
};

const createStore: Store<SignInState, SignInAction> = reducer => {
	const initialSignInState = {
		username: undefined,
		activeChallengeName: undefined,
		activeSignInSession: undefined,
	};
	let currentState = reducer(initialSignInState, { type: 'SET_INITIAL_STATE' });

	return {
		getState: () => currentState,
		dispatch: action => {
			currentState = reducer(currentState, action);
		},
	};
};

export const signInStore = createStore(signInReducer);
