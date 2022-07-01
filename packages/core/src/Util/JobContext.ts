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
	private locked = false;

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

		let terminateJob;
		const terminateJobPromise = new Promise(resolve => {
			terminateJob = resolve;
		});

		const jobResult = job(terminateJobPromise as any);

		if (jobResult instanceof Promise) {
			this.registerPromise(jobResult, terminateJob);
		}
		//  else if (jobResult instanceof Observable) {
		// }

		// At the end of the day, or you know, method call, it doesn't matter
		// what the return value is at all; we just pass it through to the
		// caller. If the result implied that there's background work being
		// done, it has been recorded. If not, it's just a pass-thru.
		return jobResult;
	}

	/**
	 *
	 * @param promise A promise that is on its way to being returned to a
	 * caller, which needs to be tracked as a background job.
	 */
	private registerPromise<T extends Promise<any>>(
		promise: T,
		terminateJob: () => void
	) {
		this.jobs.push({ jobPromise: promise, terminateJob });

		// in all of my testing, it is save to double-listen to a promise.
		// so, rather than create another layer of promising, we're just going
		// to hook into the promise we already have, and then it's done --
		// successfully or not -- we no longer need to wait for it upon exit.

		promise.then(() => {
			this.jobs = this.jobs.filter(j => j.jobPromise !== promise);
		});

		promise.catch(() => {
			this.jobs = this.jobs.filter(j => j.jobPromise !== promise);
		});
	}

	/**
	 * The number of jobs being waited on.
	 *
	 * We don't use this for anything. It's just informational for the caller,
	 * and can be used in logging and testing.
	 */
	get length() {
		return this.jobs.length;
	}

	/**
	 * Signals jobs to stop (for those that accept interruptions) and waits
	 * for confirmation that jobs have stopped.
	 */
	async exit() {
		this.locked = true;
		return Promise.all(this.jobs.map(j => j.jobPromise));
	}
}

//
// TODO: Support observables? Or just force observable makers to give us
// a promise?
//
// export type JobWrapperTypes = Promise<any> | Observable<any>;
//

export type JobWrapperTypes = Promise<any>;
export type Job<T extends JobWrapperTypes> =
	| (() => T)
	| ((onTerminate: Promise<void>) => T);

type JobEntry = {
	jobPromise: Promise<any>;
	terminateJob: () => void;
};
