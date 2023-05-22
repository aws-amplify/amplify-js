// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { documentExists, processExists, windowExists } from './helpers';

// Tested with react 18.2 - built using Vite

export function reactWebDetect() {
	return documentExists() && !!document.getElementById('react-root');
}

export function reactSSRDetect() {
	return (
		processExists() &&
		typeof process.env !== 'undefined' &&
		!!Object.keys(process.env).find(key => key.includes('react'))
	);
}
