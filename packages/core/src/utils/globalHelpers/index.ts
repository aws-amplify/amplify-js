// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from '../../errors';

export const getCrypto = () => {
	if (typeof window === 'object' && typeof window.crypto === 'object') {
		return window.crypto;
	}

	// Next.js global polyfill
	if (typeof crypto === 'object') {
		return crypto;
	}

	throw new AmplifyError({
		name: 'MissingPolyfill',
		message: 'Cannot resolve the `crypto` function from the environment.',
	});
};

export const getBtoa = () => {
	// browser
	if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
		return window.btoa;
	}

	// Next.js global polyfill
	if (typeof btoa === 'function') {
		return btoa;
	}

	throw new AmplifyError({
		name: 'Base64EncoderError',
		message: 'Cannot resolve the `btoa` function from the environment.',
	});
};

export const getAtob = () => {
	// browser
	if (typeof window !== 'undefined' && typeof window.atob === 'function') {
		return window.atob;
	}

	// Next.js global polyfill
	if (typeof atob === 'function') {
		return atob;
	}

	throw new AmplifyError({
		name: 'Base64EncoderError',
		message: 'Cannot resolve the `atob` function from the environment.',
	});
};
