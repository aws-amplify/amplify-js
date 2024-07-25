import { PredictionsError } from '../../src/errors/PredictionsError';

describe('PredictionsError', () => {
	it('works with instanceof operator', () => {
		const error = new PredictionsError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof PredictionsError).toBe(true);
	});
});
