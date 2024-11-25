// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Reducer, Store } from './types';

type AutoSignInAction =
	| { type: 'START' }
	| { type: 'SET_USERNAME'; value: string }
	| { type: 'SET_SESSION'; value?: string }
	| { type: 'RESET' };

interface AutoSignInState {
	active: boolean;
	username?: string;
	session?: string;
}

function defaultState(): AutoSignInState {
	return {
		active: false,
	};
}

const autoSignInReducer: Reducer<AutoSignInState, AutoSignInAction> = (
	state: AutoSignInState,
	action: AutoSignInAction,
): AutoSignInState => {
	switch (action.type) {
		case 'SET_USERNAME':
			return {
				...state,
				username: action.value,
			};
		case 'SET_SESSION':
			return {
				...state,
				session: action.value,
			};
		case 'START':
			return {
				...state,
				active: true,
			};
		case 'RESET':
			return defaultState();
		default:
			return state;
	}
};

const createAutoSignInStore: Store<AutoSignInState, AutoSignInAction> = (
	reducer: Reducer<AutoSignInState, AutoSignInAction>,
) => {
	let currentState = reducer(defaultState(), { type: 'RESET' });

	return {
		getState: () => currentState,
		dispatch: action => {
			currentState = reducer(currentState, action);
		},
	};
};

export const autoSignInStore = createAutoSignInStore(autoSignInReducer);
