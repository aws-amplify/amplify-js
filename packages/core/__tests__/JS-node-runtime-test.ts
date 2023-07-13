/**
 * @jest-environment node
 */

import { browserOrNode } from "../src/JS";

/** The doc block above is to change the running environment of Jest to node.
 * Since this is allowed per test file and not per test or describe, we have
 * two tests, one for node and other for browser
 */

describe('JS build test', () => {
	test('when its node ', () => {
		expect(browserOrNode()).toStrictEqual({
			isBrowser: false,
			isNode: true,
		});
	});
});
