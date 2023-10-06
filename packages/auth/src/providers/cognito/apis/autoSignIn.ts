import { AuthError } from '../../../errors/AuthError';
import { AutoSignInCallback } from '../../../types/models';
import { SignInOutput } from '../types';

const initialAutoSignIn: AutoSignInCallback =
	async (): Promise<SignInOutput> => {
		throw new AuthError({
			name: 'AutoSignInException',
			message: 'AutoSignIn flow is has not started yet',
		});
	};
export let autoSignIn: AutoSignInCallback = initialAutoSignIn;

export function setAutoSignIn(callback: AutoSignInCallback) {
	autoSignIn = callback;
}

export function resetAutoSignIn() {
	autoSignIn = initialAutoSignIn;
}
