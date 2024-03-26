import { RestApiError } from '../../src/errors';

describe('RestApiError', () => {
	it('works with instanceof operator', () => {
		const error = new RestApiError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof RestApiError).toBe(true);
	});
});
