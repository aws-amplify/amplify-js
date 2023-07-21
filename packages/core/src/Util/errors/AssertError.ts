import { AmplifyError } from '../../Errors';
import { ErrorParams } from '../../types';

export function asserts(
	assertion: boolean,
	errorParams: ErrorParams
): asserts assertion {
	if (!assertion) throw new AmplifyError(errorParams);
}
