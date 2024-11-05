// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BackgroundManagerNotOpenError } from './BackgroundManagerNotOpenError';
import { BackgroundProcessManagerState, JobEntry } from './types';

/**
 * @private For internal Amplify use.
 *
 * Creates a new scope for promises, observables, and other types of work or
 * processes that may be running in the background. This manager provides
 * an singular entrypoint to request termination and await completion.
 *
 * As work completes on its own prior to close, the manager removes them
 * from the registry to avoid holding references to completed jobs.
 */
export class BackgroundProcessManager {
	/**
	 * A string indicating whether the manager is accepting new work ("Open"),
	 * waiting for work to complete ("Closing"), or fully done with all
	 * submitted work and *not* accepting new jobs ("Closed").
	 */
	private _state = BackgroundProcessManagerState.Open;

	private _closingPromise: Promise<PromiseSettledResult<any>[]> | undefined;

	/**
	 * The list of outstanding jobs we'll need to wait for upon `close()`
	 */
	private jobs = new Set<JobEntry>();

	/**
	 * Executes an async `job` function, passing the return value through to
	 * the caller, registering it as a running job in the manager. When the
	 * manager *closes*, it will `await` the job.
	 *
	 * @param job The function to execute.
	 * @param description Optional description to help identify pending jobs.
	 * @returns The return value from the given function.
	 */
	add<T>(job: () => Promise<T>, description?: string): Promise<T>;

	/**
	 * Executes an async `job` function, passing the return value through to
	 * the caller, registering it as a running job in the manager. When the
	 * manager *closes*, it will request termination by resolving the
	 * provided `onTerminate` promise. It will then `await` the job, so it is
	 * important that the job still `resolve()` or `reject()` when responding
	 * to a termination request.
	 *
	 * @param job The function to execute.
	 * @param description Optional description to help identify pending jobs.
	 * @returns The return value from the given function.
	 */
	add<T>(
		job: (onTerminate: Promise<void>) => Promise<T>,
		description?: string,
	): Promise<T>;

	/**
	 * Create a no-op job, registers it with the manager, and returns hooks
	 * to the caller to signal the job's completion and respond to termination
	 * requests.
	 *
	 * When the manager closes, the no-op job will be `await`-ed, so its
	 * important to always `resolve()` or `reject()` when done responding to an
	 * `onTerminate` signal.
	 * @param description Optional description to help identify pending jobs.
	 * @returns Job promise hooks + onTerminate signaling promise
	 */
	add(description?: string): {
		resolve(value?: unknown): void;
		reject(reason?: any): void;
		onTerminate: Promise<void>;
	};

	/**
	 * Adds another job manager to await on at the time of closing. the inner
	 * manager's termination is signaled when this manager's `close()` is
	 * called for.
	 *
	 * @param job The inner job manager to await.
	 * @param description Optional description to help identify pending jobs.
	 */
	add<T>(job: BackgroundProcessManager, description?: string): Promise<T>;

	add<T>(
		jobOrDescription?:
			| string
			| BackgroundProcessManager
			| ((...args: any) => Promise<T>),
		optionalDescription?: string,
	) {
		let job:
			| BackgroundProcessManager
			| ((...args: any) => Promise<T>)
			| undefined;
		let description: string;

		if (typeof jobOrDescription === 'string') {
			job = undefined;
			description = jobOrDescription;
		} else {
			job = jobOrDescription;
			description = optionalDescription!;
		}

		const error = this.closedFailure(description);
		if (error) return error;

		if (job === undefined) {
			return this.addHook(description);
		} else if (typeof job === 'function') {
			return this.addFunction(job, description);
		} else if (job instanceof BackgroundProcessManager) {
			this.addManager(job, description);
		} else {
			throw new Error(
				'If `job` is provided, it must be an Observable, Function, or BackgroundProcessManager.',
			);
		}
	}

	/**
	 * Adds a **cleaner** function that doesn't immediately get executed.
	 * Instead, the caller gets a **terminate** function back. The *cleaner* is
	 * invoked only once the mananger *closes* or the returned **terminate**
	 * function is called.
	 *
	 * @param clean The cleanup function.
	 * @param description Optional description to help identify pending jobs.
	 * @returns A terminate function.
	 */
	addCleaner<T>(
		clean: () => Promise<T>,
		description?: string,
	): () => Promise<void> {
		const { resolve, onTerminate } = this.addHook(description);

		const proxy = async () => {
			await clean();
			resolve();
		};

		onTerminate.then(proxy);

		return proxy;
	}

	private addFunction<T>(
		job: () => Promise<T>,
		description?: string,
	): Promise<T>;

	private addFunction<T>(
		job: (onTerminate: Promise<void>) => Promise<T>,
		description?: string,
	): Promise<T>;

	private addFunction<T>(
		job: (() => Promise<T>) | ((onTerminate: Promise<void>) => Promise<T>),
		description?: string,
	) {
		// the function we call when we want to try to terminate this job.
		let terminate;

		// the promise the job can opt into listening to for termination.
		const onTerminate = new Promise<void>(resolve => {
			terminate = resolve;
		});

		// finally! start the job.
		const jobResult = job(onTerminate);

		// depending on what the job gives back, register the result
		// so we can monitor for completion.
		if (typeof jobResult?.then === 'function') {
			this.registerPromise(
				jobResult,
				terminate as unknown as () => void,
				description,
			);
		}

		// At the end of the day, or you know, method call, it doesn't matter
		// what the return value is at all; we just pass it through to the
		// caller.
		return jobResult;
	}

	private addManager(manager: BackgroundProcessManager, description?: string) {
		this.addCleaner(async () => manager.close(), description);
	}

	/**
	 * Creates and registers a fabricated job for processes that need to operate
	 * with callbacks/hooks. The returned `resolve` and `reject`
	 * functions can be used to signal the job is done successfully or not.
	 * The returned `onTerminate` is a promise that will resolve when the
	 * manager is requesting the termination of the job.
	 *
	 * @param description Optional description to help identify pending jobs.
	 * @returns `{ resolve, reject, onTerminate }`
	 */
	private addHook(description?: string) {
		// the resolve/reject functions we'll provide to the caller to signal
		// the state of the job.
		let promiseResolve!: (value?: unknown) => void;
		let promiseReject!: (reason?: any) => void;

		// the underlying promise we'll use to manage it, pretty much like
		// any other promise.
		const promise = new Promise((resolve, reject) => {
			promiseResolve = resolve;
			promiseReject = reject;
		});

		// the function we call when we want to try to terminate this job.
		let terminate;

		// the promise the job can opt into listening to for termination.
		const onTerminate = new Promise(resolve => {
			terminate = resolve;
		});

		this.registerPromise(
			promise,
			terminate as unknown as () => void,
			description,
		);

		return {
			resolve: promiseResolve,
			reject: promiseReject,
			onTerminate,
		};
	}

	/**
	 * Adds a Promise based job to the list of jobs for monitoring and listens
	 * for either a success or failure, upon which the job is considered "done"
	 * and removed from the registry.
	 *
	 * @param promise A promise that is on its way to being returned to a
	 * caller, which needs to be tracked as a background job.
	 * @param terminate The termination function to register, which can be
	 * invoked to request the job stop.
	 * @param description Optional description to help identify pending jobs.
	 */
	private registerPromise<T extends Promise<any>>(
		promise: T,
		terminate: () => void,
		description?: string,
	) {
		const jobEntry = { promise, terminate, description };
		this.jobs.add(jobEntry);

		// in all of my testing, it is safe to multi-subscribe to a promise.
		// so, rather than create another layer of promising, we're just going
		// to hook into the promise we already have, and when it's done
		// (successfully or not), we no longer need to wait for it upon close.

		//
		// sorry this is a bit hand-wavy:
		//
		// i believe we use `.then` and `.catch` instead of `.finally` because
		// `.finally` is invoked in a different order in the sequence, and this
		// breaks assumptions throughout and causes failures.
		promise
			.then(() => {
				this.jobs.delete(jobEntry);
			})
			.catch(() => {
				this.jobs.delete(jobEntry);
			});
	}

	/**
	 * The number of jobs being waited on.
	 *
	 * We don't use this for anything. It's just informational for the caller,
	 * and can be used in logging and testing.
	 *
	 * @returns the number of jobs.
	 */
	get length() {
		return this.jobs.size;
	}

	/**
	 * The execution state of the manager. One of:
	 *
	 * 1. "Open" -> Accepting new jobs
	 * 1. "Closing" -> Not accepting new work. Waiting for jobs to complete.
	 * 1. "Closed" -> Not accepting new work. All submitted jobs are complete.
	 */
	get state() {
		return this._state;
	}

	/**
	 * The registered `description` of all still-pending jobs.
	 *
	 * @returns descriptions as an array.
	 */
	get pending() {
		return Array.from(this.jobs).map(job => job.description);
	}

	/**
	 * Whether the manager is accepting new jobs.
	 */
	get isOpen() {
		return this._state === BackgroundProcessManagerState.Open;
	}

	/**
	 * Whether the manager is rejecting new work, but still waiting for
	 * submitted work to complete.
	 */
	get isClosing() {
		return this._state === BackgroundProcessManagerState.Closing;
	}

	/**
	 * Whether the manager is rejecting work and done waiting for submitted
	 * work to complete.
	 */
	get isClosed() {
		return this._state === BackgroundProcessManagerState.Closed;
	}

	private closedFailure(description: string) {
		if (!this.isOpen) {
			return Promise.reject(
				new BackgroundManagerNotOpenError(
					[
						`The manager is ${this.state}.`,
						`You tried to add "${description}".`,
						`Pending jobs: [\n${this.pending
							.map(t => '    ' + t)
							.join(',\n')}\n]`,
					].join('\n'),
				),
			);
		}
	}

	/**
	 * Signals jobs to stop (for those that accept interruptions) and waits
	 * for confirmation that jobs have stopped.
	 *
	 * This immediately puts the manager into a closing state and just begins
	 * to reject new work. After all work in the manager is complete, the
	 * manager goes into a `Completed` state and `close()` returns.
	 *
	 * This call is idempotent.
	 *
	 * If the manager is already closing or closed, `finalCleaup` is not executed.
	 *
	 * @param onClosed
	 * @returns The settled results of each still-running job's promise. If the
	 * manager is already closed, this will contain the results as of when the
	 * manager's `close()` was called in an `Open` state.
	 */
	async close() {
		if (this.isOpen) {
			this._state = BackgroundProcessManagerState.Closing;
			for (const job of Array.from(this.jobs)) {
				try {
					job.terminate();
				} catch (error) {
					// Due to potential races with a job's natural completion, it's
					// reasonable to expect the termination call to fail. Hence,
					// not logging as an error.
					console.warn(
						`Failed to send termination signal to job. Error: ${
							(error as Error).message
						}`,
						job,
					);
				}
			}

			// Use `allSettled()` because we want to wait for all to finish. We do
			// not want to stop waiting if there is a failure.
			this._closingPromise = Promise.allSettled(
				Array.from(this.jobs).map(j => j.promise),
			);

			await this._closingPromise;
			this._state = BackgroundProcessManagerState.Closed;
		}

		return this._closingPromise as any;
	}

	/**
	 * Signals the manager to start accepting work (again) and returns once
	 * the manager is ready to do so.
	 *
	 * If the state is already `Open`, this call is a no-op.
	 *
	 * If the state is `Closed`, this call simply updates state and returns.
	 *
	 * If the state is `Closing`, this call waits for completion before it
	 * updates the state and returns.
	 */
	async open() {
		if (this.isClosing) {
			await this.close();
		}

		this._state = BackgroundProcessManagerState.Open;
	}
}
