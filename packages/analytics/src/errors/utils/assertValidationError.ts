import {
	validationErrorMap,
} from '../types/errors';
import { AnalyticsError } from '../AnalyticsError';
import { AnalyticsValidationErrorCode } from '../types/errors';

export function assertValidationError(
	assertion: boolean,
	name: AnalyticsValidationErrorCode
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new AnalyticsError({ name, message, recoverySuggestion });
	}
}
