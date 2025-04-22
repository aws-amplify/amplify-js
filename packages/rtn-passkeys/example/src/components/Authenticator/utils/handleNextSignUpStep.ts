import { SignUpOutput } from 'aws-amplify/auth';
import { Dispatch } from 'react';

import { AuthenticatorAction } from '../reducers/authenticatorReducer';

export async function handleNextSignUpStep(
	step: SignUpOutput['nextStep'],
	dispatch: Dispatch<AuthenticatorAction>,
	username?: string,
) {
	if (step.signUpStep === 'CONFIRM_SIGN_UP') {
		dispatch({ type: 'confirm-sign-up', value: { username } });

		return;
	}

	if (step.signUpStep === 'DONE') {
		dispatch({ type: 'sign-in' });

		return;
	}

	if (step.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
		dispatch({ type: 'auto-sign-in' });
	}
}
