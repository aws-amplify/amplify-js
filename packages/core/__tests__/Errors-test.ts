import { missingConfig, invalidParameter } from '../src/Errors';

describe('Error', () => {
	test('Missing Config', () => {
		const missingConfigError = missingConfig('someField');
		expect(missingConfigError.message).toEqual(
			'Missing config value of someField'
		);
	});

	test('Invalid Param', () => {
		const invalidParameterError = invalidParameter('someArg');
		expect(invalidParameterError.message).toEqual(
			'Invalid parameter value of someArg'
		);
	});
});
