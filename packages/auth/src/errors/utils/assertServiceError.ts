import { AuthError } from '../AuthError';
import { ServiceError } from '../types/models';

export function assertServiceError(
	error: unknown
): asserts error is ServiceError {
	if (
		!error ||
		!((error as ServiceError).name || !(error as ServiceError).message)
	) {
		throw new AuthError({
			name: 'UnknownError',
			message: 'An unknown error has ocurred.',
			underlyingError: error,
		});
	}
}
