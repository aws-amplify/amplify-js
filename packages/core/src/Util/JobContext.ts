/**
 * @private For internal Amplify use.
 *
 * Creates a new "context" for promises, observables, and other types
 * of "jobs" that may be running in the background. This context provides
 * an singular entrypoint to request termination and await completion.
 *
 * As jobs complete on their own prior to exit, the context removes them
 * from the registry to avoid holding references to completed jobs.
 */
export class JobContext {
	/**
	 * Whether more jobs are being accepted.
	 */
	private locked = false;

	/**
	 * The list of outstanding jobs we'll need to wait for upon `exit()`
	 */
	private jobs: JobEntry[] = [];

	/**
	 * Creates a new "context" for promises, observables, and other types
	 * of "jobs" that may be running in the background. This context provides
	 * a centralized mechanism to request termination and await completion.
	 */
	constructor() {}

	/**
	 * Executes an async `job` function, passing the return value through to
	 * the caller, registering it as a running job in the context. When the
	 * context *exits*, it will `await` the job.
	 *
	 * @param job The function to execute.
	 * @param description Optional description to help identify pending jobs.
	 * @returns The return value from the given function.
	 */
	add<T>(job: () => Promise<T>, description?: string): Promise<T>;

	/**
	 * Executes an async `job` function, passing the return value through to
	 * the caller, registering it as a running job in the context. When the
	 * context *exits*, it will request termination by resolving the
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
		description?: string
	): Promise<T>;

	/**
	 * Create a no-op job, registers it with the context, and returns hooks
	 * to the caller to signal the job's completion and respond to termination
	 * requests.
	 *
	 * When the context exits, the no-op job will be `await`-ed, so its
	 * important to always `resolve()` or `reject()` when done responding to an
	 * `onTerminate` signal.
	 * @param description Optional description to help identify pending jobs.
	 * @returns Job promise hooks + onTerminate signaling promise
	 */
	add(description?: string): {
		resolve: (value?: unknown) => void;
		reject: (reason?: any) => void;
		onTerminate: Promise<void>;
	};

	/**
	 * Adds another job context to await on at the time of exiting. the inner
	 * context's termination is signaled when this context's `exit()` is
	 * called for.
	 *
	 * @param job The inner job context to await.
	 * @param description Optional description to help identify pending jobs.
	 */
	add(job: JobContext, description?: string);

	add(jobOrDescription?, optionalDescription?) {
		if (this.locked) {
			return Promise.reject(
				new Error(
					'The context is locked, which occurs after exit() has been called.'
				)
			);
		}

		let job;
		let description: string;

		if (typeof jobOrDescription === 'string') {
			job = undefined;
			description = jobOrDescription;
		} else {
			job = jobOrDescription;
			description = optionalDescription;
		}

		if (job === undefined) {
			return this.addHooks(description);
		} else if (typeof job === 'function') {
			return this.addFunction(job, description);
		} else if (job instanceof JobContext) {
			return this.addContext(job, description);
		} else {
			throw new Error(
				'If `job` is provided, it must be an Observable, Function, or JobContext.'
			);
		}
	}

	/**
	 * Adds a **cleaner** function that doesn't immediately get executed.
	 * Instead, the caller gets a **terminate** function back. The *cleaner* is
	 * invoked only once the context *exits* or the returned **terminate**
	 * function is called.
	 *
	 * @param clean The cleanup function.
	 * @param description Optional description to help identify pending jobs.
	 * @returns A terminate function.
	 */
	addCleaner<T>(
		clean: () => Promise<T>,
		description?: string
	): () => Promise<void> {
		const { resolve, reject, onTerminate } = this.addHooks(description);

		const proxy = async () => {
			await clean();
			resolve();
		};

		onTerminate.then(proxy);

		return proxy;
	}

	private addFunction<T>(
		job: () => Promise<T>,
		description?: string
	): Promise<T>;
	private addFunction<T>(
		job: (onTerminate: Promise<void>) => Promise<T>,
		description?: string
	): Promise<T>;
	private addFunction(job, description) {
		// the function we call when we want to try to terminate this job.
		let terminate;

		// the promise the job can opt into listening to for termination.
		const onTerminate = new Promise(resolve => {
			terminate = resolve;
		});

		// finally! start the job.
		const jobResult = job(onTerminate as any);

		// depending on what the job gives back, register the result
		// so we can monitor for completion.
		if (jobResult instanceof Promise) {
			this.registerPromise(jobResult, terminate, description);
		}

		// At the end of the day, or you know, method call, it doesn't matter
		// what the return value is at all; we just pass it through to the
		// caller.
		return jobResult;
	}

	private addContext(context: JobContext, description?: string) {
		this.addCleaner(async () => await context.exit(), description);
	}

	/**
	 * Creates and registers a fabricated job for processes that need to operate
	 * with callbacks/hooks. The returned `resolve` and `reject`
	 * functions can be used to signal the job is done successfully or not.
	 * The returned `onTerminate` is a promise that will resolve when the
	 * context is requesting the termination of the job.
	 *
	 * @param description Optional description to help identify pending jobs.
	 * @returns `{ resolve, reject, onTerminate }`
	 */
	private addHooks(description?: string) {
		// the resolve/reject functions we'll provide to the caller to signal
		// the state of the job.
		let resolve: (value?: unknown) => void;
		let reject: (reason?: any) => void;

		// the underlying promise we'll use to manage it, pretty much like
		// any other promise.
		const promise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});

		// the function we call when we want to try to terminate this job.
		let terminate;

		// the promise the job can opt into listening to for termination.
		const onTerminate = new Promise(resolveTerminate => {
			terminate = resolveTerminate;
		});

		this.registerPromise(promise, terminate, description);

		return {
			resolve,
			reject,
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
		description?: string
	) {
		this.jobs.push({ promise, terminate, description });

		// in all of my testing, it is safe to multi-subscribe to a promise.
		// so, rather than create another layer of promising, we're just going
		// to hook into the promise we already have, and when it's done
		// (successfully or not), we no longer need to wait for it upon exit.

		promise
			.then(() => {
				this.jobs = this.jobs.filter(j => j.promise !== promise);
			})
			.catch(() => {
				this.jobs = this.jobs.filter(j => j.promise !== promise);
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
		return this.jobs.length;
	}

	/**
	 * The registered `description` of all still-pending jobs.
	 *
	 * @returns descriptions as an array.
	 */
	get pending() {
		return this.jobs.map(job => job.description);
	}

	/**
	 * Signals jobs to stop (for those that accept interruptions) and waits
	 * for confirmation that jobs have stopped.
	 *
	 * @returns The settled results of each job's promise.
	 */
	async exit() {
		// prevents more jobs from being added
		this.locked = true;

		for (const job of [...this.jobs]) {
			try {
				job.terminate();
			} catch (error) {
				// Due to potential races with a job's natural completion, it's
				// reasonable to expect the termination call to fail. Hence,
				// not logging as an error.
				console.warn(
					`Failed to send termination signal to job. Error: ${error.message}`,
					job
				);
			}
		}

		// Use `allSettled()` because we want to wait for all to finish. We do
		// not want to stop waiting if there is a failure.
		return Promise.allSettled(this.jobs.map(j => j.promise));
	}
}

/**
 * Completely internal to `JobContext`, and describes the structure of an entry
 * in the jobs registry.
 */
type JobEntry = {
	/**
	 * The underlying promise provided by the job function to wait for.
	 */
	promise: Promise<any>;

	/**
	 * Request the termination of the job.
	 */
	terminate: () => void;

	/**
	 * An object provided by the caller that can be used to identify the description
	 * of the job, which can otherwise be unclear from the `promise` and
	 * `terminate` function. The `description` can be a string. (May be extended
	 * later to also support object refs.)
	 *
	 * Useful for troubleshooting why a `JobContext` is waiting for long
	 * periods of time on `exit()`.
	 */
	description?: string;
};
