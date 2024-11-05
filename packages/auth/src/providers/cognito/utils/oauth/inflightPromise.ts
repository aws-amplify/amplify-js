// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const inflightPromises: ((value: void | PromiseLike<void>) => void)[] = [];

export const addInflightPromise = (resolver: () => void) => {
	inflightPromises.push(resolver);
};

export const resolveAndClearInflightPromises = () => {
	while (inflightPromises.length) {
		inflightPromises.pop()?.();
	}
};
