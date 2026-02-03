// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NonPausableTransferTask } from '../../../types/common';

export function createAbortableTask<T>(
	executor: (abortController: AbortController) => Promise<T>,
): NonPausableTransferTask<T> & {
	then: Promise<T>['then'];
	catch: Promise<T>['catch'];
	finally: Promise<T>['finally'];
} {
	const abortController = new AbortController();
	let state: NonPausableTransferTask<T>['state'] = 'IN_PROGRESS';

	const resultPromise = executor(abortController);

	const wrappedPromise = resultPromise
		.then(result => {
			state = 'SUCCESS';

			return result;
		})
		.catch(error => {
			state = abortController.signal.aborted ? 'CANCELED' : 'ERROR';

			throw error;
		});

	const operation = {
		result: wrappedPromise,
		cancel: () => {
			abortController.abort();
			state = 'CANCELED';
		},
		get state() {
			return state;
		},
		then: wrappedPromise.then.bind(wrappedPromise),
		catch: wrappedPromise.catch.bind(wrappedPromise),
		finally: wrappedPromise.finally.bind(wrappedPromise),
	};

	return operation;
}
