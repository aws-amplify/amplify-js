jest.mock('@aws-amplify/core', () => ({
	__esModule: true,
	...jest.requireActual('@aws-amplify/core'),
	browserOrNode() {
		return {
			isBrowser: false,
			isNode: true,
		};
	},
}));

import { PubSub } from '../src/PubSub';

describe('PubSub', () => {
	describe('.subscribe', () => {
		it('should fail in a Node environment', () => {
			expect(() =>
				PubSub.subscribe('topic')
			).toThrowErrorMatchingInlineSnapshot(
				`"Subscriptions are not supported in Node"`
			);
		});
	});
});
