import { AuthError } from '../error/AuthError';
import { assertServiceError } from './assertServiceError';

export function throwServiceError(error: unknown): never {
	assertServiceError(error);

	const { name, message } = error;

	throw new AuthError({ name, message });
}
