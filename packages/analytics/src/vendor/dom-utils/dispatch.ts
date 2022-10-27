/**
 * Copyright (c) 2017-2022, Philip Walton <philip@philipwalton.com>
 */

/**
 * Dispatches an event on the passed element.
 * @param {!Element} element The DOM element to dispatch the event on.
 * @param {string} eventType The type of event to dispatch.
 * @param {Object|string=} eventName A string name of the event constructor
 *     to use. Defaults to 'Event' if nothing is passed or 'CustomEvent' if
 *     a value is set on `initDict.detail`. If eventName is given an object
 *     it is assumed to be initDict and thus reassigned.
 * @param {Object=} initDict The initialization attributes for the
 *     event. A `detail` property can be used here to pass custom data.
 * @return {boolean} The return value of `element.dispatchEvent`, which will
 *     be false if any of the event listeners called `preventDefault`.
 */
export function dispatch(
	element,
	eventType,
	evtName = 'Event',
	init_dict = {}
) {
	let event;
	let isCustom;
	let initDict = init_dict;
	let eventName = evtName;

	// eventName is optional
	if (typeof eventName === 'object') {
		initDict = eventName;
		eventName = 'Event';
	}

	initDict['bubbles'] = initDict['bubbles'] || false;
	initDict['cancelable'] = initDict['cancelable'] || false;
	initDict['composed'] = initDict['composed'] || false;

	// If a detail property is passed, this is a custom event.
	if ('detail' in initDict) isCustom = true;
	eventName = isCustom ? 'CustomEvent' : eventName;

	// Tries to create the event using constructors, if that doesn't work,
	// fallback to `document.createEvent()`.
	try {
		event = new window[eventName](eventType, initDict);
	} catch (err) {
		event = document.createEvent(eventName);
		const initMethod = 'init' + (isCustom ? 'Custom' : '') + 'Event';
		event[initMethod](
			eventType,
			initDict['bubbles'],
			initDict['cancelable'],
			initDict['detail']
		);
	}

	return element.dispatchEvent(event);
}
