import { SignInOutput, resendSignUpCode } from 'aws-amplify/auth';
import { Dispatch } from 'react';

import { AuthenticatorAction } from '../reducers/authenticatorReducer';

export async function handleNextSignInStep(
	step: SignInOutput['nextStep'],
	dispatch: Dispatch<AuthenticatorAction>,
	username?: string,
) {
	if (
		step.signInStep === 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION' ||
		step.signInStep === 'CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION'
	) {
		dispatch({
			type: 'select-mfa-type',
			value: {
				allowedMfaTypes: step.allowedMFATypes || [],
				signInStep: step.signInStep,
			},
		});

		return;
	}

	if (step.signInStep === 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION') {
		dispatch({
			type: 'select-first-factor',
			value: {
				availableChallenges: step.availableChallenges || [],
				signInStep: step.signInStep,
			},
		});

		return;
	}
	if (step.signInStep === 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP') {
		dispatch({
			type: 'setup-totp',
			value: {
				setupUri: step.totpSetupDetails.getSetupUri('test-app').toString(),
				signInStep: step.signInStep,
			},
		});

		return;
	}

	if (step.signInStep === 'CONTINUE_SIGN_IN_WITH_EMAIL_SETUP') {
		dispatch({
			type: 'setup-email-otp',
			value: { signInStep: step.signInStep },
		});

		return;
	}

	if (
		step.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE' ||
		step.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE' ||
		step.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE' ||
		step.signInStep === 'CONFIRM_SIGN_IN_WITH_PASSWORD'
	) {
		dispatch({
			type: 'confirm-sign-in',
			value: { signInStep: step.signInStep },
		});

		return;
	}

	if (step.signInStep === 'CONFIRM_SIGN_UP') {
		await resendSignUpCode({ username: username! });

		dispatch({
			type: 'confirm-sign-up',
			value: {
				username,
				signInStep: step.signInStep,
			},
		});

		return;
	}

	if (step.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
		dispatch({
			type: 'new-password',
			value: {
				signInStep: step.signInStep,
			},
		});

		return;
	}

	if (step.signInStep === 'DONE') {
		dispatch({ type: 'authenticated' });
	}
}
