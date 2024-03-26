import { InAppMessagingError } from '../../../src/inAppMessaging/errors/InAppMessagingError';

describe('InAppMessagingError', () => {
	it('works with instanceof operator', () => {
		const error = new InAppMessagingError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof InAppMessagingError).toBe(true);
	});
});
