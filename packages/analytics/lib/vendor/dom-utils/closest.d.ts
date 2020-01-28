/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */
/**
 * Gets the closest parent element that matches the passed selector.
 * @param {Element} element The element whose parents to check.
 * @param {string} selector The CSS selector to match against.
 * @param {boolean=} shouldCheckSelf True if the selector should test against
 *     the passed element itself.
 * @return {Element|undefined} The matching element or undefined.
 */
export default function closest(
	element: any,
	selector: any,
	shouldCheckSelf?: boolean
): any;
