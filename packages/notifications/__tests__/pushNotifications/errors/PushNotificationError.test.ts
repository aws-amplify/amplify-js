import { PushNotificationError } from '../../../src/pushNotifications/errors/PushNotificationError';

describe('PushNotificationError', () => {
	it('works with instanceof operator', () => {
		const error = new PushNotificationError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof PushNotificationError).toBe(true);
	});
});
