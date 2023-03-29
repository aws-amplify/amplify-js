import { AuthError } from "../AuthError";

type ServiceError = {
	name: string;
	message: string;
};


export function assertServiceError(
	error: unknown
): asserts error is ServiceError {
	if (
		!error ||
		!((error as ServiceError).name ||
		!(error as ServiceError).message)
	) {
		throw new AuthError({
			name: 'UnknownError',
			message: 'An unknown error has ocurred.',
			underlyingException: error,
		});
	}
}