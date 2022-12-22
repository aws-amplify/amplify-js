type AuthErrorConstructor = {
	message: string;
	underlyingException?: Error | unknown;
	recoverySuggestion?: string;
	name: string;
};

export class AuthError extends Error {
	underlyingException?: Error | unknown;
	recoverySuggestion?: string;
	/**
	 * Creates an Auth error
	 *
	 * @param message text that describes the main problem.
	 * @param underlyingException the underlying cause of the error.
	 * @param recoverySuggestion suggestion to recover from the error.
	 */
	constructor(error: AuthErrorConstructor) {
		super(error.message);

		this.name = error.name;
		this.underlyingException = error.underlyingException;
		this.recoverySuggestion = error.recoverySuggestion;

		Error.captureStackTrace(this);
	}
}
