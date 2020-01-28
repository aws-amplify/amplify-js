/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */
import matches from './matches';
import parents from './parents';
/**
 * Gets the closest parent element that matches the passed selector.
 * @param {Element} element The element whose parents to check.
 * @param {string} selector The CSS selector to match against.
 * @param {boolean=} shouldCheckSelf True if the selector should test against
 *     the passed element itself.
 * @return {Element|undefined} The matching element or undefined.
 */
export default function closest(element, selector, shouldCheckSelf) {
	if (shouldCheckSelf === void 0) {
		shouldCheckSelf = false;
	}
	if (!(element && element.nodeType === 1 && selector)) return;
	var parentElements = (shouldCheckSelf ? [element] : []).concat(
		parents(element)
	);
	for (var i = 0, parent_1; (parent_1 = parentElements[i]); i++) {
		if (matches(parent_1, selector)) return parent_1;
	}
}
//# sourceMappingURL=closest.js.map
