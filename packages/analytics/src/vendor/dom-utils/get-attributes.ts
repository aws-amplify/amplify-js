/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */

/**
 * Gets all attributes of an element as a plain JavaScriot object.
 * @param {Element} element The element whose attributes to get.
 * @return {!Object} An object whose keys are the attribute keys and whose
 *     values are the attribute values. If no attributes exist, an empty
 *     object is returned.
 */
export function getAttributes(element) {
	const attrs = {};

	// Validate input.
	if (!(element && element.nodeType === 1)) return attrs;

	// Return an empty object if there are no attributes.
	const map = element.attributes;
	if (map.length === 0) return {};

	for (let i = 0, attr; (attr = map[i]); i++) {
		attrs[attr.name] = attr.value;
	}
	return attrs;
}
