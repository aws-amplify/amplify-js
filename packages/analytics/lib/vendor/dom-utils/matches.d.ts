/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */
/**
 * Tests if a DOM elements matches any of the test DOM elements or selectors.
 * @param {Element} element The DOM element to test.
 * @param {Element|string|Array<Element|string>} test A DOM element, a CSS
 *     selector, or an array of DOM elements or CSS selectors to match against.
 * @return {boolean} True of any part of the test matches.
 */
export default function matches(element: any, test: any): any;
