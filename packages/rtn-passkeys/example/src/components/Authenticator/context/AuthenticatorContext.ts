import { createContext, Dispatch } from 'react';

import {
	AuthenticatorAction,
	AuthenticatorState,
} from '../reducers/authenticatorReducer';

type AuthenticatorContext = {
	state: AuthenticatorState;
	dispatch: Dispatch<AuthenticatorAction>;
};

export const AuthenticatorContext = createContext<AuthenticatorContext>({
	state: { state: 'loading' },
	dispatch: () => {},
});
