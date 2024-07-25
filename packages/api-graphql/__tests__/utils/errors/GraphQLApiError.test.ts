import { GraphQLApiError } from '../../../src/utils/errors';

describe('GraphQLApiError', () => {
	it('works with instanceof operator', () => {
		const error = new GraphQLApiError({
			name: 'TestError',
			message: 'message',
		});

		expect(error instanceof GraphQLApiError).toBe(true);
	});
});
