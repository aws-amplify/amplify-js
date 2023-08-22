// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Category,
	CustomUserAgentDetails,
	getAmplifyUserAgent,
	StorageAction,
} from '@aws-amplify/core';

export const byteLength = (x: unknown) => {
	if (typeof x === 'string') {
		return x.length;
	} else if (isArrayBuffer(x)) {
		return x.byteLength;
	} else if (isBlob(x)) {
		return x.size;
	} else {
		throw new Error('Cannot determine byte length of ' + x);
	}
};

export const isFile = (x: unknown): x is File => {
	return typeof x !== 'undefined' && x instanceof File;
};

export const isBlob = (x: unknown): x is Blob => {
	return typeof x !== 'undefined' && x instanceof Blob;
};

export const getStorageUserAgentValue = (
	action: StorageAction,
	customUserAgentDetails?: CustomUserAgentDetails
): string =>
	getAmplifyUserAgent({
		category: Category.Storage,
		action,
		...customUserAgentDetails,
	});

const isArrayBuffer = (x: unknown): x is ArrayBuffer => {
	return typeof x !== 'undefined' && x instanceof ArrayBuffer;
};
