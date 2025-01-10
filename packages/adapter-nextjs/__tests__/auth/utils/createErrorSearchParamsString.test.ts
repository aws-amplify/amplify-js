import { createErrorSearchParamsString } from '../../../src/auth/utils/createErrorSearchParamsString';

describe('createErrorSearchParamsString', () => {
	test.each([
		{
			error: null,
			errorDescription: null,
			expected: '',
		},
		{
			error: 'error',
			errorDescription: null,
			expected: 'error=error',
		},
		{
			error: null,
			errorDescription: 'errorDescription',
			expected: 'error_description=errorDescription',
		},
		{
			error: 'error',
			errorDescription: 'errorDescription',
			expected: 'error=error&error_description=errorDescription',
		},
	])(
		`returns $expected when called with error: $error and errorDescription: $errorDescription`,
		({ error, errorDescription, expected }) => {
			const result = createErrorSearchParamsString({ error, errorDescription });

			expect(result).toEqual(expected);
		},
	);
});
