/**
 * @jest-environment jsdom
 */

/** The doc block above is to change the running environment of Jest to
 * jsdom (which is also the default) Since this is allowed per test file
 * and not per test or describe, we have two tests, one for node and other for browser
 */
import * as core from '../dist/aws-amplify-core.js';

describe('JS browserOrNode build test', () => {
	test('when its browser ', () => {
		expect(core.browserOrNode()).toStrictEqual({
			isBrowser: true,
			isNode: false,
		});
	});
});
