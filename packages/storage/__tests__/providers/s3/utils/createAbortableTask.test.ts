// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAbortableTask } from '../../../../src/providers/s3/utils/createAbortableTask';

describe('createAbortableTask', () => {
	it('should start with IN_PROGRESS state', () => {
		const task = createAbortableTask(() => Promise.resolve('result'));
		expect(task.state).toBe('IN_PROGRESS');
	});

	it('should transition to SUCCESS state when resolved', async () => {
		const task = createAbortableTask(() => Promise.resolve('result'));
		const result = await task;
		expect(result).toBe('result');
		expect(task.state).toBe('SUCCESS');
	});

	it('should transition to ERROR state when rejected', async () => {
		const error = new Error('test error');
		const task = createAbortableTask(() => Promise.reject(error));

		await expect(task).rejects.toThrow('test error');
		expect(task.state).toBe('ERROR');
	});

	it('should transition to CANCELED state when aborted', async () => {
		const task = createAbortableTask(abortController => {
			return new Promise((resolve, reject) => {
				abortController.signal.addEventListener('abort', () => {
					reject(new Error('aborted'));
				});
			});
		});

		task.cancel();
		await expect(task).rejects.toThrow();
		expect(task.state).toBe('CANCELED');
	});

	it('should provide access to result promise', async () => {
		const task = createAbortableTask(() => Promise.resolve('result'));
		const result = await task.result;
		expect(result).toBe('result');
	});

	it('should pass abortController to executor', () => {
		const mockExecutor = jest.fn(() => Promise.resolve());
		createAbortableTask(mockExecutor);

		expect(mockExecutor).toHaveBeenCalledWith(expect.any(AbortController));
	});
});
