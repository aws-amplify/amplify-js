// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { documentExists, processExists, windowExists } from './helpers';

// Tested with react 18.2 - built using Vite

export function reactWebDetect() {
	const elementKeyPrefixedWithReact = k => {
		return k.startsWith('_react') || k.startsWith('__react');
	};
	const elementIsReactEnabled = e => {
		return Object.keys(e).find(elementKeyPrefixedWithReact);
	};
	const allElementsWithId = () => Array.from(document.querySelectorAll('[id]'));

	return documentExists() && allElementsWithId().some(elementIsReactEnabled);
}

export function reactSSRDetect() {
	return (
		processExists() &&
		typeof process.env !== 'undefined' &&
		!!Object.keys(process.env).find(key => key.includes('react'))
	);
}
