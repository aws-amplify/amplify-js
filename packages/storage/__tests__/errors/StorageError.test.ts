import { StorageError } from '../../src/errors/StorageError';

describe('StorageError', () => {
	it('works with instanceof operator', () => {
		const error = new StorageError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof StorageError).toBe(true);
	});
});
