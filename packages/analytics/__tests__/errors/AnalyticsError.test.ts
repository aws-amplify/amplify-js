import { AnalyticsError } from '../../src/errors/AnalyticsError';

describe('AnalyticsError', () => {
	it('works with instanceof operator', () => {
		const error = new AnalyticsError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof AnalyticsError).toBe(true);
	});
});
