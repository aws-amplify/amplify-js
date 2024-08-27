// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthMFAType } from '../../../types';

import { Reducer, Store } from './types';

type MfaSetupInitial = undefined;

interface MfaSetupSelectionRequired {
	status: 'IN_PROGRESS';
	options: AuthMFAType[];
}
interface MfaSetupSelectionComplete {
	status: 'COMPLETE';
	value: AuthMFAType;
	options: AuthMFAType[];
}

type MfaSetupState =
	| MfaSetupInitial
	| MfaSetupSelectionRequired
	| MfaSetupSelectionComplete;

type MfaSetupAction =
	| { type: 'RESET' }
	| { type: 'IN_PROGRESS'; value: AuthMFAType[] }
	| { type: 'COMPLETE'; value: AuthMFAType }
	| { type: 'AUTO'; value: Omit<MfaSetupSelectionComplete, 'status'> };

const mfaSetupReducer: Reducer<MfaSetupState, MfaSetupAction> = (
	state,
	action,
) => {
	if (action.type === 'RESET') {
		return;
	}
	if (action.type === 'IN_PROGRESS') {
		return {
			status: 'IN_PROGRESS',
			options: action.value,
		};
	}
	if (state?.status === 'IN_PROGRESS' && action.type === 'COMPLETE') {
		return {
			...state,
			status: 'COMPLETE',
			value: action.value,
		};
	}
	if (action.type === 'AUTO') {
		return {
			status: 'COMPLETE',
			options: action.value.options,
			value: action.value.value,
		};
	}

	return state;
};

const createStore: Store<MfaSetupState, MfaSetupAction> = reducer => {
	let currentState: MfaSetupState;

	return {
		getState: () => currentState,
		dispatch: action => {
			currentState = reducer(currentState, action);
		},
	};
};

export const mfaSetupStore = createStore(mfaSetupReducer);

export const resetMfaSetupState = () => {
	mfaSetupStore.dispatch({ type: 'RESET' });
};
