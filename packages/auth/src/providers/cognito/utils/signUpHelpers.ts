// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HubClass } from '@aws-amplify/core/internals/utils';
import { signIn } from '../apis/signIn';
import { SignInInput, SignInOutput } from '../types';
import { AutoSignInEventData } from '../types/models';
import { AutoSignInCallback } from '../../../types/models';
import { AuthError } from '../../../errors/AuthError';
import { SignUpCommandOutput } from './clients/CognitoIdentityProvider/types';
import { resetAutoSignIn } from '../apis/autoSignIn';

const MAX_AUTOSIGNIN_POLLING_MS = 3 * 60 * 1000;

export const HubInternal = new HubClass('internal-hub');

export function handleCodeAutoSignIn(signInInput: SignInInput) {
	const stopHubListener = HubInternal.listen<AutoSignInEventData>(
		'auth-internal',
		async ({ payload }) => {
			switch (payload.event) {
				case 'confirmSignUp': {
					const response = payload.data;
					let signInError: unknown;
					let signInOutput: SignInOutput | undefined;
					if (response?.isSignUpComplete) {
						try {
							signInOutput = await signIn(signInInput);
						} catch (error) {
							signInError = error;
						}
						HubInternal.dispatch('auth-internal', {
							event: 'autoSignIn',
							data: {
								error: signInError,
								output: signInOutput,
							},
						});
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
	}, MAX_AUTOSIGNIN_POLLING_MS);
}

// Debounces the auto sign-in flow with link
// This approach avoids running the useInterval and signIn API twice in a row.
// This issue would be common as React.18 introduced double rendering of the
// useEffect hook on every mount.
// https://github.com/facebook/react/issues/24502
// https://legacy.reactjs.org/docs/strict-mode.html#ensuring-reusable-state
function debounce<F extends (...args: any[]) => any>(fun: F, delay: number) {
	let timer: NodeJS.Timer | undefined;
	return function (
		args: F extends (...args: infer A) => any ? A : never
	): void {
		if (!timer) {
			fun(...args);
		}
		clearTimeout(timer as NodeJS.Timer);
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
		const currentTime = Date.now() - start;
		const maxTime = MAX_AUTOSIGNIN_POLLING_MS;
		if (currentTime > maxTime) {
			clearInterval(autoSignInPollingIntervalId);
			setAutoSignInStarted(false);
			reject(
				new AuthError({
					name: 'AutoSignInError',
					message: 'the account was not confirmed on time.',
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
const debouncedAutoSignInWithCode = debounce(handleAutoSignInWithCode, 300);
const debouncedAutoSignUserConfirmed = debounce(
	handleAutoSignInUserConfirmed,
	300
);

let autoSignInStarted: boolean = false;

export function isAutoSignInStarted(): boolean {
	return autoSignInStarted;
}
export function setAutoSignInStarted(value: boolean) {
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
async function handleAutoSignInUserConfirmed(
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
async function handleAutoSignInWithCode(
	signInInput: SignInOutput,
	error: unknown,
	resolve: Function,
	reject: Function
) {
	if (!signInInput && error) {
		reject(error);
		resetAutoSignIn();
	}
	resolve(signInInput);
	resetAutoSignIn();
}
export function autoSignInWhenUserIsConfirmed(
	signInInput: SignInInput
): AutoSignInCallback {
	return async () => {
		return new Promise<SignInOutput>(async (resolve, reject) => {
			debouncedAutoSignUserConfirmed([signInInput, resolve, reject]);
		});
	};
}

export function autoSignInWhenUserIsConfirmedWithCode(
	signInOutput: SignInOutput,
	error?: unknown
): AutoSignInCallback {
	return async () => {
		return new Promise<SignInOutput>(async (resolve, reject) => {
			debouncedAutoSignInWithCode([signInOutput, error, resolve, reject]);
		});
	};
}
