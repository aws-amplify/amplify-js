import { InteractionsError } from '../../src/errors/InteractionsError';

describe('InteractionsError', () => {
	it('works with instanceof operator', () => {
		const error = new InteractionsError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof InteractionsError).toBe(true);
	});
});
