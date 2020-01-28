/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */
import { JS } from '@aws-amplify/core';
var proto =
	JS.browserOrNode().isBrowser && window['Element']
		? window['Element'].prototype
		: null;
var nativeMatches = proto
	? proto.matches ||
	  // @ts-ignore
	  proto.matchesSelector ||
	  // @ts-ignore
	  proto.webkitMatchesSelector ||
	  // @ts-ignore
	  proto.mozMatchesSelector ||
	  // @ts-ignore
	  proto.msMatchesSelector ||
	  // @ts-ignore
	  proto.oMatchesSelector
	: null;
/**
 * Tests if a DOM elements matches any of the test DOM elements or selectors.
 * @param {Element} element The DOM element to test.
 * @param {Element|string|Array<Element|string>} test A DOM element, a CSS
 *     selector, or an array of DOM elements or CSS selectors to match against.
 * @return {boolean} True of any part of the test matches.
 */
export default function matches(element, test) {
	// Validate input.
	if (element && element.nodeType === 1 && test) {
		// if test is a string or DOM element test it.
		if (typeof test === 'string' || test.nodeType === 1) {
			return (
				element === test || matchesSelector(element, /** @type {string} */ test)
			);
		} else if ('length' in test) {
			// if it has a length property iterate over the items
			// and return true if any match.
			for (var i = 0, item = void 0; (item = test[i]); i++) {
				if (element === item || matchesSelector(element, item)) return true;
			}
		}
	}
	// Still here? Return false
	return false;
}
/**
 * Tests whether a DOM element matches a selector. This polyfills the native
 * Element.prototype.matches method across browsers.
 * @param {!Element} element The DOM element to test.
 * @param {string} selector The CSS selector to test element against.
 * @return {boolean} True if the selector matches.
 */
function matchesSelector(element, selector) {
	if (typeof selector !== 'string') return false;
	if (nativeMatches) return nativeMatches.call(element, selector);
	var nodes = element.parentNode.querySelectorAll(selector);
	for (var i = 0, node = void 0; (node = nodes[i]); i++) {
		if (node === element) return true;
	}
	return false;
}
//# sourceMappingURL=matches.js.map
