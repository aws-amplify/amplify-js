// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const isWebWorker = () => {
	if (typeof self === 'undefined') {
		return false;
	}
	const selfContext = self as { WorkerGlobalScope?: any };
	return (
		typeof selfContext.WorkerGlobalScope !== 'undefined' &&
		self instanceof selfContext.WorkerGlobalScope
	);
};
