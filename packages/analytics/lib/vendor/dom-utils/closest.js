'use strict';
/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */
Object.defineProperty(exports, '__esModule', { value: true });
var matches_1 = require('./matches');
var parents_1 = require('./parents');
/**
 * Gets the closest parent element that matches the passed selector.
 * @param {Element} element The element whose parents to check.
 * @param {string} selector The CSS selector to match against.
 * @param {boolean=} shouldCheckSelf True if the selector should test against
 *     the passed element itself.
 * @return {Element|undefined} The matching element or undefined.
 */
function closest(element, selector, shouldCheckSelf) {
	if (shouldCheckSelf === void 0) {
		shouldCheckSelf = false;
	}
	if (!(element && element.nodeType === 1 && selector)) return;
	var parentElements = (shouldCheckSelf ? [element] : []).concat(
		parents_1.default(element)
	);
	for (var i = 0, parent_1; (parent_1 = parentElements[i]); i++) {
		if (matches_1.default(parent_1, selector)) return parent_1;
	}
}
exports.default = closest;
//# sourceMappingURL=closest.js.map
