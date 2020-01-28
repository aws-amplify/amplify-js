'use strict';
/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */
Object.defineProperty(exports, '__esModule', { value: true });
var closest_1 = require('./closest');
var matches_1 = require('./matches');
/**
 * Delegates the handling of events for an element matching a selector to an
 * ancestor of the matching element.
 * @param {!Node} ancestor The ancestor element to add the listener to.
 * @param {string} eventType The event type to listen to.
 * @param {string} selector A CSS selector to match against child elements.
 * @param {!Function} callback A function to run any time the event happens.
 * @param {Object=} opts A configuration options object. The available options:
 *     - useCapture<boolean>: If true, bind to the event capture phase.
 *     - deep<boolean>: If true, delegate into shadow trees.
 * @return {Object} The delegate object. It contains a destroy method.
 */
function delegate(ancestor, eventType, selector, callback, opts) {
	if (opts === void 0) {
		opts = {};
	}
	// Defines the event listener.
	var listener = function(event) {
		var delegateTarget;
		// If opts.composed is true and the event originated from inside a Shadow
		// tree, check the composed path nodes.
		if (opts['composed'] && typeof event['composedPath'] === 'function') {
			var composedPath = event.composedPath();
			for (var i = 0, node = void 0; (node = composedPath[i]); i++) {
				if (node.nodeType === 1 && matches_1.default(node, selector)) {
					delegateTarget = node;
				}
			}
		} else {
			// Otherwise check the parents.
			delegateTarget = closest_1.default(event.target, selector, true);
		}
		if (delegateTarget) {
			callback.call(delegateTarget, event, delegateTarget);
		}
	};
	ancestor.addEventListener(eventType, listener, opts['useCapture']);
	return {
		destroy: function() {
			ancestor.removeEventListener(eventType, listener, opts['useCapture']);
		},
	};
}
exports.default = delegate;
//# sourceMappingURL=delegate.js.map
