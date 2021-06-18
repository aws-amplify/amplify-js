jest.mock('@aws-amplify/core', () => ({
	__esModule: true,
	...jest.requireActual('@aws-amplify/core'),
	browserOrNode() {
		return {
			isBrowser: true,
			isNode: false,
		};
	},
}));

import Observable from 'zen-observable-ts';
import { Amplify } from '@aws-amplify/core';
import { PubSub } from '../src/PubSub';

describe('PubSub', () => {
	describe('.subscribe', () => {
		it('should not fail when in a browser environment', () => {
			expect(() => PubSub.subscribe('topic')).not.toThrow();
			expect(PubSub.subscribe('topic')).toBeInstanceOf(Observable);
		});

		it('should not fail when configured for SSR', () => {
			Amplify.configure({ ssr: true });

			expect(() => PubSub.subscribe('topic')).not.toThrow();
			expect(PubSub.subscribe('topic')).toBeInstanceOf(Observable);
		});
	});
});
