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

import Observable from 'zen-observable-ts';
import { Amplify } from '@aws-amplify/core';
import { PubSub } from '../src/PubSub';

describe('PubSub', () => {
	describe('.subscribe', () => {
		it('should not fail when in a node environment', () => {
			expect(() => PubSub.subscribe('topic')).not.toThrow();
			expect(PubSub.subscribe('topic')).toBeInstanceOf(Observable);
		});

		it('should fail when configured for SSR', () => {
			Amplify.configure({ ssr: true });

			expect(() =>
				PubSub.subscribe('topic')
			).toThrowErrorMatchingInlineSnapshot(
				`"Subscriptions are not supported for Server-Side Rendering (SSR)"`
			);
		});
	});
});
