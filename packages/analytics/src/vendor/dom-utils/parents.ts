/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */

/**
 * Returns an array of a DOM element's parent elements.
 * @param {!Element} element The DOM element whose parents to get.
 * @return {!Array} An array of all parent elemets, or an empty array if no
 *     parent elements are found.
 */
export function parents(ele) {
	const list = [];
	let element = ele;
	while (element && element.parentNode && element.parentNode.nodeType === 1) {
		element = /** @type {!Element} */ element.parentNode;
		list.push(element);
	}
	return list;
}
