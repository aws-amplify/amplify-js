import Observable from 'zen-observable-ts';
import { JobContext } from '../src/Util/JobContext';
import { SubscriptionProcessor } from '@aws-amplify/datastore/src/sync/processors/subscription';
import { rejections, exitOnError } from 'winston';

describe('JobContext', () => {
	test('can wait for a promise to finish', async () => {
		// when we get passed `exit()`, we need proof that the promise we're
		// waiting on actually ran. <in a booming voice>: THIS IS THAT PROOF.
		let proof = false;

		const context = new JobContext();

		// add a job that finishes later, but don't wait for it.
		// we want to ensure that exit() is called before the promise
		// completes.
		context.add(async () => {
			return new Promise(resolve => {
				setTimeout(() => {
					proof = true;
					resolve();
				}, 50);
			});
		});

		// the job should not have completed at the time we call this.
		await context.exit();

		expect(proof).toBe(true);
	});

	test('returns the value of the promise when adding it', async () => {
		const context = new JobContext();

		const value = await context.add(async () => Promise.resolve('VALUE'));

		await context.exit();
		expect(value).toEqual('VALUE');
	});

	test('passes thrown promise errors through', async () => {
		const context = new JobContext();

		try {
			await context.add(async () => {
				throw new Error('not today, friend!');
			});
			expect(true).toBe(false);
		} catch (error) {
			expect(error.message).toEqual('not today, friend!');
		}
	});

	test('errors thrown in jobs do not block exit', async () => {
		const context = new JobContext();

		try {
			await context.add(async () => {
				throw new Error('Enough shenanigans!');
			});
			expect(true).toBe(false);
		} catch (error) {
			// no need to handle here.
		}

		await context.exit();

		expect(true).toBe(true);
	});

	test('promises remove themselves from the context when complete, but not before', async () => {
		const context = new JobContext();

		const resultPromise = context.add(async () => {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve();
				}, 50);
			});
		});

		expect(context.length).toBe(1);
		await resultPromise;
		expect(context.length).toBe(0);

		// just demonstrating good behavior: Always exit your contexts.
		await context.exit();
	});

	test('promises remove themselves from the context when failed, but not before', async () => {
		const context = new JobContext();

		const resultPromise = context.add(async () => {
			return new Promise((resolve, raise) => {
				setTimeout(() => {
					raise(new Error('a fuss'));
				}, 50);
			});
		});

		expect(context.length).toBe(1);
		try {
			await resultPromise;
			expect(true).toBe(false);
		} catch (error) {
			expect(error.message).toEqual('a fuss');
		}

		// the internal JobContext `catch()` handler for the promise is still
		// in the promise callback queue. we need to put this "thread" onto
		// the end of the queue to allow that catch handler to execute ahead
		// of us. we can do that by simply creating another promise and
		// awaiting it:
		await Promise.resolve();

		// and now JobContext's catch handler for the rejected promise will
		// have been invoked.
		expect(context.length).toBe(0);

		// just demonstrating good behavior: Always exit your contexts.
		await context.exit();
	});

	test('blocks new jobs once exited', async () => {
		const context = new JobContext();
		await context.exit();

		try {
			await context.add(async () =>
				Promise.resolve('This should never be returned.')
			);
			expect(true).toBe(false);
		} catch (error) {
			expect(error.message).toContain('locked');
		}
	});

	test('waits for multiple promises', async () => {
		const context = new JobContext();

		const results = [];

		for (let i = 0; i < 10; i++) {
			const _i = i;
			results.push(false);
			context.add(async () => {
				return new Promise(resolve => {
					setTimeout(() => {
						results[_i] = true;
						resolve();
					}, 5 * _i);
				});
			});
		}

		await context.exit();

		expect(results.length).toEqual(10); // sanity check
		expect(results.every(v => v === true)).toBe(true);
	});

	test('can send termination signals to jobs that support termination, with resolve', async () => {
		let completed = false;
		const context = new JobContext();

		const resultPromise = context.add(async onTerminate => {
			return new Promise((resolve, reject) => {
				const timer = setTimeout(() => {
					// this is the happy path that we plan not to reach in
					// this test.
					completed = true;
					resolve();
				}, 30);

				// Jobs support termination by listening for `onTerminate` to
				// complete. The job still needs to decide whether to resolve
				// or reject.
				onTerminate.then(() => {
					clearTimeout(timer);
					resolve();
				});
			});
		});

		// the job is pending
		expect(context.length).toBe(1);
		await context.exit();

		// after exit(), the job should be cleared
		expect(context.length).toBe(0);

		// giving a wait, to make sure the job doesn't actually fire
		// after being cleared with exit()
		await new Promise(resolve => setTimeout(resolve, 100));

		// then making sure the job really really didn't fire.
		expect(completed).toBe(false);
	});

	test('can send termination signals to jobs that support termination, with reject', async () => {
		let completed = false;
		let thrown = undefined;
		const context = new JobContext();

		const resultPromise = context.add(async onTerminate => {
			return new Promise((resolve, reject) => {
				const timer = setTimeout(() => {
					// this is the happy path that we plan not to reach in
					// this test.
					completed = true;
					resolve();
				}, 30);

				// Jobs support termination by listening for `onTerminate` to
				// complete. The job still needs to decide whether to resolve
				// or reject.
				onTerminate.then(() => {
					clearTimeout(timer);
					reject('badness happened');
				});
			});
		});

		resultPromise.catch(error => {
			thrown = error;
		});

		// the job is pending
		expect(context.length).toBe(1);

		const results = await context.exit();
		expect(results[0].status).toEqual('rejected');

		// after exit(), the job should be cleared
		expect(context.length).toBe(0);

		// giving a wait, to make sure the job doesn't actually fire
		// after being cleared with exit()
		await new Promise(resolve => setTimeout(resolve, 100));

		// then making sure the job really really didn't fire.
		expect(completed).toBe(false);
		expect(thrown).toEqual('badness happened');
	});

	test('attempts to terminate all, but patiently waits for persistent jobs', async () => {
		const context = new JobContext();

		let terminationAttemptCount = 0;
		const results = [];

		for (let i = 0; i < 10; i++) {
			const _i = i;
			results.push(false);
			context.add(async onTerminate => {
				return new Promise((resolve, reject) => {
					const timer = setTimeout(() => {
						results[_i] = true;
						resolve();
					}, 5 * _i);

					// simulate heterogenous jobs, some of which comply with
					// termination requests, some do not.
					onTerminate.then(() => {
						terminationAttemptCount++;
						if (_i % 2 === 0) {
							clearTimeout(timer);

							// remember, if a job *does* terminate, it still
							// needs resolve/reject to unblock `exit()`.
							_i > 5 ? resolve() : reject();
						}
					});
				});
			});
		}

		// capture resolutions so we can ensure we actually tested this with a
		// mix of resolves and rejects.
		const resolutions = await context.exit();

		expect(results.length).toEqual(10); // sanity check
		expect(results.filter(v => v === true).length).toBe(5);
		expect(terminationAttemptCount).toEqual(10);
		expect(resolutions.filter(r => r.status === 'rejected').length).toEqual(3);
	});

	test('can be used to terminate other types of bg jobs, like zen subscriptions', async () => {
		const context = new JobContext();
		let count = 0;

		// we could also put the context.job() outside the observable and call
		// unsubscribe() on the subscription. all depends where the control
		// needs to occur. this example explicitly intends to demonstrate
		// that the observable constructor can manage it like a hook.
		new Observable(observer => {
			const { resolve, onTerminate } = context.add();
			const interval = setInterval(() => observer.next({}), 10);

			const unsubscribe = () => {
				resolve(); // always remember to resolve/reject!
				clearInterval(interval);
				observer.complete();
			};

			onTerminate.then(unsubscribe);
			return unsubscribe;
		}).subscribe(() => count++);

		await new Promise(resolve => setTimeout(resolve, 50));

		// this should signal to termination and end, and the observable should
		// respond by calling its internal terminate().
		await context.exit();
		const countSnapshot = count;

		expect(count).toBeGreaterThan(0);

		// after a little more time, we should see that there have been no more
		// messages.
		await new Promise(resolve => setTimeout(resolve, 50));
		expect(countSnapshot).toEqual(count);
	});

	test('can provide cleanup functions for use in zen observables', async () => {
		const context = new JobContext();
		let count = 0;

		const subscription = new Observable(observer => {
			const interval = setInterval(() => observer.next({}), 10);

			// LOOK: here's the magic. (tada!)
			return context.addCleaner(async () => {
				clearInterval(interval);
			});
		}).subscribe(() => count++);

		await new Promise(resolve => setTimeout(resolve, 50));

		// this should signal to termination and end, and the observable should
		// respond by calling its internal terminate().
		await context.exit();
		const countSnapshot = count;

		expect(count).toBeGreaterThan(0);

		// after a little more time, we should see that there have been no more
		// messages.
		await new Promise(resolve => setTimeout(resolve, 50));
		expect(countSnapshot).toEqual(count);
	});

	test('cleaner is resolved when used as zen cleaner and subscription is unsubscribed', async () => {
		const context = new JobContext();
		let count = 0;

		const subscription = new Observable(observer => {
			const interval = setInterval(() => observer.next({}), 10);

			// LOOK: here's the magic. (tada!)
			return context.addCleaner(async () => {
				clearInterval(interval);
			});
		}).subscribe(() => count++);

		// after a short period, we should see the counter has gone up.
		await new Promise(resolve => setTimeout(resolve, 25));
		const countSnapshot = count;
		expect(countSnapshot).toBeGreaterThan(0);

		// after unsubscribing and waiting again, the count should have
		// remained the same.
		subscription.unsubscribe();
		await new Promise(resolve => setTimeout(resolve, 25));
		expect(count).toEqual(countSnapshot);

		// we should also see zero waiting jobs
		expect(context.length).toEqual(0);

		// it's good practice always to exit() your job contexts.
		await context.exit();
	});

	test('exit() is idempotent, firing onTerminate signals only once', async () => {
		// As long as `onTerminate` is implemented as a `Promise`, this is kind
		// if a silly test, because promises are idempontent. But, it's still
		// an important test to guard against regressions if we stop using a
		// `Promise` for `onTerminate` later.

		const context = new JobContext();

		let terminateSignalCount = 0;

		context.add(
			async onTerminate =>
				new Promise(resolve => {
					// don't actually resolve right away to ensure there is
					// "opportunity" for `onTerminate` to trigger more than
					// once if it is implemented wrong.
					onTerminate.then(() => {
						terminateSignalCount++;
						setTimeout(resolve, 10);
					});
				})
		);

		// accumulate a bunch of exit promises, only the first of which should
		// send the exit signal, but all of which should await resolution.
		const exits = [0, 1, 2, 3, 4, 5].map(i => context.exit());

		// ensure everything has settled
		const resolved = await Promise.allSettled(exits);

		expect(terminateSignalCount).toEqual(1);
		expect(resolved.map(r => r.status).every(v => v === 'fulfilled')).toBe(
			true
		);
	});

	test('can contain a nested context', async () => {
		const outer = new JobContext();
		const inner = new JobContext();

		let proof = false;

		outer.add(inner);
		inner.add(
			async () =>
				new Promise(resolve =>
					setTimeout(() => {
						proof = true;
						resolve();
					}, 10)
				)
		);

		await outer.exit();

		expect(proof).toBe(true);
	});

	test('calls inner context exit upon outer context exit', async () => {
		const outer = new JobContext();
		const inner = new JobContext();

		let proof = false;

		outer.add(inner);
		inner.add(
			async onTerminate =>
				new Promise(resolve =>
					onTerminate.then(() => {
						proof = true;
						resolve();
					})
				)
		);

		await new Promise(resolve => setTimeout(resolve, 1));
		expect(proof).toBe(false);

		await outer.exit();

		expect(proof).toBe(true);
	});
});
