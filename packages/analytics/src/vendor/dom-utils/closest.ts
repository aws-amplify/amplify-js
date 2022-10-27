/**
 * Copyright (c) 2017-2022, Philip Walton <philip@philipwalton.com>
 */

import { matches } from './matches';
import { parents } from './parents';

/**
 * Gets the closest parent element that matches the passed selector.
 * @param {Element} element The element whose parents to check.
 * @param {string} selector The CSS selector to match against.
 * @param {boolean=} shouldCheckSelf True if the selector should test against
 *     the passed element itself.
 * @return {Element|undefined} The matching element or undefined.
 */
export function closest(element, selector, shouldCheckSelf = false) {
	if (!(element && element.nodeType === 1 && selector)) return;
	const parentElements = (shouldCheckSelf ? [element] : []).concat(
		parents(element)
	);

	for (let i = 0, parent; (parent = parentElements[i]); i++) {
		if (matches(parent, selector)) return parent;
	}
}
