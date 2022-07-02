import Observable from 'zen-observable-ts';
import { JobContext } from '../src/Util/JobContext';

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

	test('can be used to terminate zen subscriptions, perpetual events', async () => {
		const context = new JobContext();
		let count = 0;

		// we could also put the context.job() outside the observable and call
		// unsubscribe() on the subscription. all depends where the control
		// needs to occur. this example explicitly intends to demonstrate
		// that the observable constructor can manage it like a hook.
		const subscription = new Observable(observer => {
			const { resolve, onTerminate } = context.job();
			const interval = setInterval(() => observer.next({}), 10);

			const terminate = () => {
				resolve();
				clearInterval(interval);
				observer.complete();
			};

			onTerminate.then(terminate);
			return terminate;
		}).subscribe(() => count++);

		await new Promise(resolve => setTimeout(resolve, 50));

		// this should signal to termination and end, and the observable should
		// respond by calling its internal terminate().
		await context.exit();
		const countSnapshot = count;

		expect(count).toBeGreaterThan(2);

		// after a little more time, we should see that there have been no more
		// messages.
		await new Promise(resolve => setTimeout(resolve, 50));
		expect(countSnapshot).toEqual(count);
	});
});
