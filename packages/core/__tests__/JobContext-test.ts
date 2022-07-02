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
				}, 100);
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
				}, 100);
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
				}, 100);

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
		await new Promise(resolve => setTimeout(resolve, 200));

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
				}, 100);

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
		await new Promise(resolve => setTimeout(resolve, 200));

		// then making sure the job really really didn't fire.
		expect(completed).toBe(false);
		expect(thrown).toEqual('badness happened');
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
