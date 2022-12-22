import { AuthError } from '../error/AuthError';
import { assertServiceError } from './assertServiceError';

/**
 *  Throws  service error
 *
 * @param  error service error
 *
 * @throws
 *  error: {@link AuthError}
 */
export function throwServiceError(error: unknown): never {
	assertServiceError(error);

	const { name, message } = error;

	throw new AuthError({ name, message });
}
