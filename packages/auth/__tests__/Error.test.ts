import { NoUserPoolError } from '../src/Errors';
import { AuthErrorTypes } from '../src/types/Auth';

describe('NoUserPoolError', () => {
	it('works with instanceof operator', () => {
		const error = new NoUserPoolError(AuthErrorTypes.NoConfig);

		expect(error instanceof NoUserPoolError).toBe(true);
	});
});
