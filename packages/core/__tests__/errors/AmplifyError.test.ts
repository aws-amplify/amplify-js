import { AmplifyError } from '../../src/errors/AmplifyError';

describe('AmplifyError', () => {
	it('works with instanceof operator', () => {
		const error = new AmplifyError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof AmplifyError).toBe(true);
	});
});
