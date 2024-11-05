// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const globalExists = () => {
	return typeof global !== 'undefined';
};

export const globalThisExists = () => {
	return typeof globalThis !== 'undefined';
};

export const windowExists = () => {
	return typeof window !== 'undefined';
};

export const documentExists = () => {
	return typeof document !== 'undefined';
};

export const processExists = () => {
	return typeof process !== 'undefined';
};

export const keyPrefixMatch = (object: object, prefix: string) => {
	return !!Object.keys(object).find(key => key.startsWith(prefix));
};
