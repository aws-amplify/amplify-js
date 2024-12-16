// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HubInternal } from '@aws-amplify/core/internals/utils';

import { signIn } from '../apis/signIn';
import { SignInInput, SignInOutput } from '../types';
import { AutoSignInEventData } from '../types/models';
import { AutoSignInCallback } from '../../../types/models';
import { AuthError } from '../../../errors/AuthError';
import { resetAutoSignIn, setAutoSignIn } from '../apis/autoSignIn';
import { AUTO_SIGN_IN_EXCEPTION } from '../../../errors/constants';
import { signInWithUserAuth } from '../apis/signInWithUserAuth';

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
		},
	);

	// This will stop the listener if confirmSignUp is not resolved.
	const timeOutId = setTimeout(() => {
		stopHubListener();
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

	return (args: F extends (...args: infer A) => any ? A : never): void => {
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
	resolve: (value: SignInOutput) => void,
	reject: (reason?: any) => void,
) {
	const start = Date.now();
	const autoSignInPollingIntervalId = setInterval(async () => {
		const elapsedTime = Date.now() - start;
		const maxTime = MAX_AUTOSIGNIN_POLLING_MS;
		if (elapsedTime > maxTime) {
			clearInterval(autoSignInPollingIntervalId);
			reject(
				new AuthError({
					name: AUTO_SIGN_IN_EXCEPTION,
					message: 'The account was not confirmed on time.',
					recoverySuggestion:
						'Try to verify your account by clicking the link sent your email or phone and then login manually.',
				}),
			);
			resetAutoSignIn();
		} else {
			try {
				const signInOutput = await signIn(signInInput);
				if (signInOutput.nextStep.signInStep !== 'CONFIRM_SIGN_UP') {
					resolve(signInOutput);
					clearInterval(autoSignInPollingIntervalId);
					resetAutoSignIn();
				}
			} catch (error) {
				clearInterval(autoSignInPollingIntervalId);
				reject(error);
				resetAutoSignIn();
			}
		}
	}, 5000);
}
const debouncedAutoSignInWithLink = debounce(handleAutoSignInWithLink, 300);
const debouncedAutoSignWithCodeOrUserConfirmed = debounce(
	handleAutoSignInWithCodeOrUserConfirmed,
	300,
);

export function autoSignInWhenUserIsConfirmedWithLink(
	signInInput: SignInInput,
): AutoSignInCallback {
	return async () => {
		return new Promise<SignInOutput>((resolve, reject) => {
			debouncedAutoSignInWithLink([signInInput, resolve, reject]);
		});
	};
}
async function handleAutoSignInWithCodeOrUserConfirmed(
	signInInput: SignInInput,
	resolve: (value: SignInOutput) => void,
	reject: (reason?: any) => void,
) {
	try {
		const output =
			signInInput?.options?.authFlowType === 'USER_AUTH'
				? await signInWithUserAuth(signInInput)
				: await signIn(signInInput);

		resolve(output);
		resetAutoSignIn();
	} catch (error) {
		reject(error);
		resetAutoSignIn();
	}
}

function autoSignInWithCode(signInInput: SignInInput): AutoSignInCallback {
	return async () => {
		return new Promise<SignInOutput>((resolve, reject) => {
			debouncedAutoSignWithCodeOrUserConfirmed([signInInput, resolve, reject]);
		});
	};
}

export const autoSignInUserConfirmed = autoSignInWithCode;
