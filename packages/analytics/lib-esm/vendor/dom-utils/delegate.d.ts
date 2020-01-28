/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */
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
export default function delegate(
	ancestor: any,
	eventType: any,
	selector: any,
	callback: any,
	opts?: {}
): {
	destroy: () => void;
};
