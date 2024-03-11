/** The doc block above is to change the running environment of Jest to
 * jsdom (which is also the default) Since this is allowed per test file
 * and not per test or describe, we have two tests, one for node and other for browser
 */
import { isBrowser } from '../src/utils';

describe('isBrowser build test', () => {
	// Prevent Jest test resolves Node.js version from the global `process` of the
	// testing the Node.js process.
	const originalVersions = process.versions;
	beforeEach(() => {
		// @ts-expect-error test overrides
		delete global.process.versions;
	});

	afterEach(() => {
		global.process.versions = originalVersions;
	});

	test('when it is browser ', () => {
		expect(isBrowser()).toBe(true);
	});
});
