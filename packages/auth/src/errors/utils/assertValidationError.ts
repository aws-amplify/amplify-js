import { validationErrorMap } from '../../common/AuthErrorStrings';
import { AuthError } from '../AuthError';
import { AuthValidationErrorCode } from '../types/validation';

export function assertValidationError(
	assertion: boolean,
	name: AuthValidationErrorCode
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new AuthError({ name, message, recoverySuggestion });
	}
}
