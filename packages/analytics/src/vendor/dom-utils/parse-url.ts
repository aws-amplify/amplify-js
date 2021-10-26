/**
 * Copyright (c) 2017, Philip Walton <philip@philipwalton.com>
 */

import { JS } from '@aws-amplify/core';

const HTTP_PORT = '80';
const HTTPS_PORT = '443';
const DEFAULT_PORT = RegExp(':(' + HTTP_PORT + '|' + HTTPS_PORT + ')$');

const a = JS.browserOrNode().isBrowser ? document.createElement('a') : null;
const cache = {};

/**
 * Parses the given url and returns an object mimicing a `Location` object.
 * @param {string} url The url to parse.
 * @return {!Object} An object with the same properties as a `Location`.
 */
export function parseUrl(u) {
	let url = u;
	// All falsy values (as well as ".") should map to the current URL.
	url = !url || url === '.' ? location.href : url;

	if (cache[url]) return cache[url];

	a.href = url;

	// When parsing file relative paths (e.g. `../index.html`), IE will correctly
	// resolve the `href` property but will keep the `..` in the `path` property.
	// It will also not include the `host` or `hostname` properties. Furthermore,
	// IE will sometimes return no protocol or just a colon, especially for things
	// like relative protocol URLs (e.g. "//google.com").
	// To workaround all of these issues, we reparse with the full URL from the
	// `href` property.
	if (url.charAt(0) === '.' || url.charAt(0) === '/') return parseUrl(a.href);

	// Don't include default ports.
	let port = a.port === HTTP_PORT || a.port === HTTPS_PORT ? '' : a.port;

	// PhantomJS sets the port to "0" when using the file: protocol.
	port = port === '0' ? '' : port;

	// Sometimes IE incorrectly includes a port for default ports
	// (e.g. `:80` or `:443`) even when no port is specified in the URL.
	// http://bit.ly/1rQNoMg
	const host = a.host.replace(DEFAULT_PORT, '');

	// Not all browser support `origin` so we have to build it.
	const origin = a['origin'] ? a['origin'] : a.protocol + '//' + host;

	// Sometimes IE doesn't include the leading slash for pathname.
	// http://bit.ly/1rQNoMg
	const pathname = a.pathname.charAt(0) === '/' ? a.pathname : '/' + a.pathname;

	return (cache[url] = {
		hash: a.hash,
		host,
		hostname: a.hostname,
		href: a.href,
		origin,
		pathname,
		port,
		protocol: a.protocol,
		search: a.search,
	});
}
