import Observable from 'zen-observable-ts';

/**
 * @private For internal Amplify use.
 *
 * A scope to collect background outstanding jobs, subscriptions, promises, and
 * callbacks that will all need to be awaited, called, canceled, etc at some
 * context exit boundary or condition.
 *
 * Intended to herd the vast number of promises, subscriptions, etc. that occur
 * in categories like DataStore and make it easy to safely "exit" the context
 * with the confidence that all work in the context is done.
 *
 * Contexts are nestable.
 *
 * Two usage patterns are recommended.
 *
 * ```
 * // defined where you'll have access to `exit()` the context appropriately
 * const context = new JobContext();
 *
 * async function do() {
 * 	// make sure this is the first line of the function.
 * 	return context.add(async () => {
 * 		return await getResult();
 * 	});
 * };
 *
 * // later, perhaps in a class's `stop()` call:
 * await context.complete();
 * ```
 *
 * OR
 *
 * ```
 * // defined where you'll have access to `exit()` the context appropriately
 * const context = new JobContext();
 *
 * function getSubscription() {
 * 	// make sure this is your first line
 * 	return context.add(({ onTerminate, complete }) => {
 * 		const subscription = thingy.subscribe();
 * 		onTerminate.then(async () => {
 * 			await subscription.unsubscribe();
 * 			complete();
 * 		});
 * 	});
 * }
 *
 * // later, perhaps in a class's `stop()` call:
 * await context.complete();
 * ```
 *
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
	 * Creates a new context for jobs, subscriptions, promises, and other
	 * types of callback and background jobs to register themselves in an
	 * ergonomic fashion.
	 */
	constructor() {}

	/**
	 * Executes a function, passing the return value through to the caller,
	 * checking it on its way through to see if it indicates a background job.
	 * If it does, it registers it as a running job in the context.
	 *
	 * @param job The function to execute.
	 * @returns The return value from the given function.
	 */
	add<T extends JobWrapperTypes>(job: Job<T>): T {
		if (this.locked) {
			throw new Error(
				'The context is locked, which occurs after exit() has been called.'
			);
		}

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
			this.registerPromise(jobResult, terminate);
		}

		// At the end of the day, or you know, method call, it doesn't matter
		// what the return value is at all; we just pass it through to the
		// caller.
		return jobResult;
	}

	/**
	 * Creates and registers a superficial job for processes, like observables,
	 * that need to operate with callbacks. The returned `resolve` and `reject`
	 * functions can be used to signal the job is done successfully or not.
	 * The returned `onTerminate` is a promise that will resolve when the
	 * context is requesting the termination of the job.
	 *
	 * @returns `{ resolve, reject, onTerminate }`
	 */
	job() {
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
		const onTerminate = new Promise(resolve => {
			terminate = resolve;
		});

		this.registerPromise(promise, terminate);

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
	 */
	private registerPromise<T extends Promise<any>>(
		promise: T,
		terminate: () => void
	) {
		this.jobs.push({ promise, terminate });

		// in all of my testing, it is safe to multi-subscribe to a promise.
		// so, rather than create another layer of promising, we're just going
		// to hook into the promise we already have, and when it's done (
		// successfully or not), we no longer need to wait for it upon exit.

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

//
// TODO: Support observables? Or just force observable makers to give us
// a promise?
//
// export type JobWrapperTypes = Promise<any> | Observable<any>;
//

export type JobWrapperTypes = Promise<any>;

/**
 * A thing that we can wait for completion on. When invoked, a first parameter
 * will be passed in -- a Promise signals a termination request if completed.
 */
export type Job<T extends JobWrapperTypes> =
	| (() => T)
	| ((onTerminate: Promise<void>) => T);

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
};
