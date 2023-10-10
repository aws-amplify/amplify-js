// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HubInternal } from '@aws-amplify/core/internals/utils';
import { signIn } from '../apis/signIn';
import { SignInInput, SignInOutput } from '../types';
import { AutoSignInEventData } from '../types/models';
import { AutoSignInCallback } from '../../../types/models';
import { AuthError } from '../../../errors/AuthError';
import { SignUpCommandOutput } from './clients/CognitoIdentityProvider/types';
import { resetAutoSignIn, setAutoSignIn } from '../apis/autoSignIn';
import { AUTO_SIGN_IN_EXCEPTION } from '../../../errors/constants';

const MAX_AUTOSIGNIN_POLLING_MS = 3 * 60 * 1000;

export function handleCodeAutoSignIn(signInInput: SignInInput) {
	const stopHubListener = HubInternal.listen<AutoSignInEventData>(
		'auth-internal',
		async ({ payload }) => {
			switch (payload.event) {
				case 'confirmSignUp': {
					const response = payload.data;
					if (response?.isSignUpComplete) {
						HubInternal.dispatch('auth-internal', {
							event: 'autoSignIn',
						});
						setAutoSignIn(autoSignInWithCode(signInInput));
						stopHubListener();
					}
				}
			}
		}
	);

	// This will stop the listener if confirmSignUp is not resolved.
	const timeOutId = setTimeout(() => {
		stopHubListener();
		setAutoSignInStarted(false);
		clearTimeout(timeOutId);
		resetAutoSignIn();
	}, MAX_AUTOSIGNIN_POLLING_MS);
}

// Debounces the auto sign-in flow with link
// This approach avoids running the useInterval and signIn API twice in a row.
// This issue would be common as React.18 introduced double rendering of the
// useEffect hook on every mount.
// https://github.com/facebook/react/issues/24502
// https://legacy.reactjs.org/docs/strict-mode.html#ensuring-reusable-state
type TimeOutOutput = ReturnType<typeof setTimeout>;
function debounce<F extends (...args: any[]) => any>(fun: F, delay: number) {
	let timer: TimeOutOutput | undefined;
	return function (
		args: F extends (...args: infer A) => any ? A : never
	): void {
		if (!timer) {
			fun(...args);
		}
		clearTimeout(timer as TimeOutOutput);
		timer = setTimeout(() => {
			timer = undefined;
		}, delay);
	};
}

function handleAutoSignInWithLink(
	signInInput: SignInInput,
	resolve: Function,
	reject: Function
) {
	const start = Date.now();
	const autoSignInPollingIntervalId = setInterval(async () => {
		const elapsedTime = Date.now() - start;
		const maxTime = MAX_AUTOSIGNIN_POLLING_MS;
		if (elapsedTime > maxTime) {
			clearInterval(autoSignInPollingIntervalId);
			setAutoSignInStarted(false);
			reject(
				new AuthError({
					name: AUTO_SIGN_IN_EXCEPTION,
					message: 'The account was not confirmed on time.',
					recoverySuggestion:
						'Try to verify your account by clicking the link sent your email or phone and then login manually.',
				})
			);
			resetAutoSignIn();
			return;
		} else {
			try {
				const signInOutput = await signIn(signInInput);
				if (signInOutput.nextStep.signInStep !== 'CONFIRM_SIGN_UP') {
					resolve(signInOutput);
					clearInterval(autoSignInPollingIntervalId);
					setAutoSignInStarted(false);
					resetAutoSignIn();
					return;
				}
			} catch (error) {
				clearInterval(autoSignInPollingIntervalId);
				setAutoSignInStarted(false);
				reject(error);
				resetAutoSignIn();
			}
		}
	}, 5000);
}
const debouncedAutoSignInWithLink = debounce(handleAutoSignInWithLink, 300);
const debouncedAutoSignWithCodeOrUserConfirmed = debounce(
	handleAutoSignInWithCodeOrUserConfirmed,
	300
);

let autoSignInStarted: boolean = false;

let usernameUsedForAutoSignIn: string | undefined;

export function setUsernameUsedForAutoSignIn(username?: string) {
	usernameUsedForAutoSignIn = username;
}
export function isAutoSignInUserUsingConfirmSignUp(username: string) {
	return usernameUsedForAutoSignIn === username;
}

export function isAutoSignInStarted(): boolean {
	return autoSignInStarted;
}
export function setAutoSignInStarted(value: boolean) {
	if (value === false) {
		setUsernameUsedForAutoSignIn(undefined);
	}
	autoSignInStarted = value;
}

export function isSignUpComplete(output: SignUpCommandOutput): boolean {
	return !!output.UserConfirmed;
}

export function autoSignInWhenUserIsConfirmedWithLink(
	signInInput: SignInInput
): AutoSignInCallback {
	return async () => {
		return new Promise<SignInOutput>(async (resolve, reject) => {
			debouncedAutoSignInWithLink([signInInput, resolve, reject]);
		});
	};
}
async function handleAutoSignInWithCodeOrUserConfirmed(
	signInInput: SignInInput,
	resolve: Function,
	reject: Function
) {
	try {
		const output = await signIn(signInInput);
		resolve(output);
		resetAutoSignIn();
	} catch (error) {
		reject(error);
		resetAutoSignIn();
	}
}

function autoSignInWithCode(signInInput: SignInInput): AutoSignInCallback {
	return async () => {
		return new Promise<SignInOutput>(async (resolve, reject) => {
			debouncedAutoSignWithCodeOrUserConfirmed([signInInput, resolve, reject]);
		});
	};
}

export const autoSignInUserConfirmed = autoSignInWithCode;
