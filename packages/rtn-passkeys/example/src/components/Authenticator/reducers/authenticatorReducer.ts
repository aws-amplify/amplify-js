import { Reducer } from 'react';

import { AutoCompletableString } from '../types';

export type AuthState =
	| 'sign-in'
	| 'sign-up'
	| 'confirm-sign-up'
	| 'confirm-sign-in'
	| 'setup-totp'
	| 'setup-email-otp'
	| 'select-mfa-type'
	| 'select-mfa-setup-type'
	| 'select-first-factor'
	| 'auto-sign-in'
	| 'new-password'
	| 'authenticated'
	| 'loading'
	| AutoCompletableString;

export interface AuthenticatorState {
	state: AuthState;
	props?: any; // todo
}

export interface AuthenticatorAction {
	type: AuthState;
	value?: any; // todo
}

export const authenticatorReducer: Reducer<
	AuthenticatorState,
	AuthenticatorAction
> = (_state, action) => {
	switch (action.type) {
		case 'sign-in': {
			return {
				state: 'sign-in',
			};
		}
		case 'sign-up': {
			return {
				state: 'sign-up',
			};
		}
		case 'confirm-sign-up': {
			return {
				state: 'confirm-sign-up',
				props: action.value,
			};
		}
		case 'confirm-sign-in': {
			return {
				state: 'confirm-sign-in',
				props: action.value,
			};
		}
		case 'authenticated': {
			return {
				state: 'authenticated',
			};
		}
		case 'setup-totp': {
			return {
				state: 'setup-totp',
				props: action.value,
			};
		}
		case 'setup-email-otp': {
			return {
				state: 'setup-email-otp',
			};
		}
		case 'select-mfa-type': {
			return {
				state: 'select-mfa-type',
				props: action.value,
			};
		}
		case 'select-first-factor':
			return {
				state: 'select-first-factor',
				props: action.value,
			};
		case 'auto-sign-in':
			return {
				state: 'auto-sign-in',
			};
		case 'new-password':
			return {
				state: 'new-password',
			};
		case 'loading': {
			return {
				state: 'loading',
			};
		}
	}
	throw new Error(`Unknown Action: ${action.type}`);
};
