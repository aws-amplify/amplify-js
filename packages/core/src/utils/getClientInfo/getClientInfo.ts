// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger } from '../../Logger';

const logger = new ConsoleLogger('getClientInfo');

export function getClientInfo() {
	if (typeof window === 'undefined') {
		return {};
	}

	return browserClientInfo();
}

function browserClientInfo() {
	if (typeof window === 'undefined') {
		logger.warn('No window object available to get browser client info');

		return {};
	}

	const nav = window.navigator;
	if (!nav) {
		logger.warn('No navigator object available to get browser client info');

		return {};
	}

	const { platform, product, vendor, userAgent, language } = nav;
	const type = getBrowserType(userAgent);
	const timezone = browserTimezone();

	return {
		platform,
		make: product || vendor,
		model: type.type,
		version: type.version,
		appVersion: [type.type, type.version].join('/'),
		language,
		timezone,
	};
}

function browserTimezone() {
	const tzMatch = /\(([A-Za-z\s].*)\)/.exec(new Date().toString());

	return tzMatch ? tzMatch[1] || '' : '';
}

function getBrowserType(userAgent: string) {
	// The latest user agents for Opera: https://www.whatismybrowser.com/guides/the-latest-user-agent/opera
	const operaMatch = /.+(Opera[\s[A-Z]*|OPR[\sA-Z]*)\/([0-9.]+).*/i.exec(
		userAgent
	);
	if (operaMatch) {
		return { type: operaMatch[1], version: operaMatch[2] };
	}

	// The latest user agents for Edge: https://www.whatismybrowser.com/guides/the-latest-user-agent/edge
	const ieMatch = /.+(Trident|Edge|Edg|EdgA|EdgiOS)\/([0-9.]+).*/i.exec(
		userAgent
	);
	if (ieMatch) {
		return { type: ieMatch[1], version: ieMatch[2] };
	}

	// The latest user agents for web browsers on Firefox and Chrome
	// https://www.whatismybrowser.com/guides/the-latest-user-agent/firefox
	// https://www.whatismybrowser.com/guides/the-latest-user-agent/chrome
	const cfMatch = /.+(Chrome|CriOS|Firefox|FxiOS)\/([0-9.]+).*/i.exec(
		userAgent
	);
	if (cfMatch) {
		return { type: cfMatch[1], version: cfMatch[2] };
	}

	// The latest user agents for Safari: https://www.whatismybrowser.com/guides/the-latest-user-agent/safari
	const sMatch = /.+(Safari)\/([0-9.]+).*/i.exec(userAgent);
	if (sMatch) {
		return { type: sMatch[1], version: sMatch[2] };
	}

	const awkMatch = /.+(AppleWebKit)\/([0-9.]+).*/i.exec(userAgent);
	if (awkMatch) {
		return { type: awkMatch[1], version: awkMatch[2] };
	}

	const anyMatch = /.*([A-Z]+)\/([0-9.]+).*/i.exec(userAgent);
	if (anyMatch) {
		return { type: anyMatch[1], version: anyMatch[2] };
	}

	return { type: '', version: '' };
}
