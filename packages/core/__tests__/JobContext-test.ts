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

	test('can terminate a long-running job and allows termination', async () => {
		let completed = false;
		const context = new JobContext();

		const resultPromise = context.add(async onTerminate => {
			return new Promise(resolve => {
				const timer = setTimeout(() => {
					// this is the happy path that we plan not to reach in
					// this test.
					completed = true;
					resolve();
				}, 5000);
			});
		});

		expect(context.length).toBe(1);
		await resultPromise;
		expect(context.length).toBe(0);

		// just demonstrating good behavior: Always exit your contexts.
		await context.exit();

		expect(completed).toBe(false);
	});

	// test('can pass observables through', async () => {
	// 	const context = new JobContext();

	// 	context.add(new Observable());
	// });
});
