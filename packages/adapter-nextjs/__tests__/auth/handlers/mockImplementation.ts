import { createErrorSearchParamsString } from '../../../src/auth/utils';

export const mockCreateErrorSearchParamsStringImplementation: typeof createErrorSearchParamsString =
	({ error, errorDescription }) => {
		if (error && errorDescription) {
			return 'hasErrorAndErrorDescription';
		}

		if (error) {
			return 'hasError';
		}

		if (errorDescription) {
			return 'hasErrorDescription';
		}

		return '';
	};
