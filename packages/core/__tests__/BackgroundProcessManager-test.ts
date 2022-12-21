import Observable from 'zen-observable-ts';
import {
	BackgroundProcessManager,
	BackgroundProcessManagerState,
	allSettled,
} from '../src/Util/BackgroundProcessManager';

/**
 * NOTE: Jest's promise rejection assertion uses substring matching.
 *
 * This:
 *
 * ```js
 * await expect(resultPromise).rejects.toThrow('a fuss')
 * ```
 *
 * ... will pass with `Error('just a fuss')`.
 */

describe('BackgroundProcessManager', () => {
	test('can wait for a promise to finish', async () => {
		// when we get passed `close()`, we need proof that the promise we're
		// waiting on actually ran. <in a booming voice>: THIS IS THAT PROOF.
		let proof = false;

		const manager = new BackgroundProcessManager();

		// add a job that finishes later, but don't wait for it.
		// we want to ensure that close() is called before the promise
		// completes.
		manager.add(async () => {
			return new Promise(resolve => {
				setTimeout(() => {
					proof = true;
					resolve();
				}, 50);
			});
		});

		// the job should not have completed at the time we `close()`
		expect(proof).toBe(false);
		await manager.close();

		expect(proof).toBe(true);
	});

	test('returns the value of the promise when adding it', async () => {
		const manager = new BackgroundProcessManager();

		const value = await manager.add(async () => Promise.resolve('VALUE'));

		await manager.close();
		expect(value).toEqual('VALUE');
	});

	test('passes thrown promise errors through', async () => {
		const manager = new BackgroundProcessManager();

		await expect(
			manager.add(async () => {
				throw new Error('not today, friend!');
			})
		).rejects.toThrow('not today, friend!');
	});

	test('errors thrown in jobs do not block close', async () => {
		const manager = new BackgroundProcessManager();

		await expect(
			manager.add(async () => {
				throw new Error('Enough shenanigans!');
			})
		).rejects.toThrow();

		await expect(manager.close()).resolves.not.toThrow();
	});

	test('promises remove themselves from the manager when complete, but not before', async () => {
		const manager = new BackgroundProcessManager();

		const resultPromise = manager.add(async () => {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve();
				}, 50);
			});
		});

		expect(manager.length).toBe(1);
		await resultPromise;
		expect(manager.length).toBe(0);

		// just demonstrating good behavior: Always close your managers.
		await manager.close();
	});

	test('promises remove themselves from the manager when failed, but not before', async () => {
		const manager = new BackgroundProcessManager();

		const resultPromise = manager.add(async () => {
			return new Promise((resolve, raise) => {
				setTimeout(() => {
					raise(new Error('a fuss'));
				}, 50);
			});
		});

		expect(manager.length).toBe(1);

		await expect(resultPromise).rejects.toThrow('a fuss');

		// the internal Jobmanager `catch()` handler for the promise is still
		// in the promise callback queue. we need to put this "thread" onto
		// the end of the queue to allow that catch handler to execute ahead
		// of us. we can do that by simply creating another promise and
		// awaiting it:
		await Promise.resolve();

		// and now Jobmanager's catch handler for the rejected promise will
		// have been invoked.
		expect(manager.length).toBe(0);

		// just demonstrating good behavior: Always close your managers.
		await manager.close();
	});

	test('blocks new jobs once closed', async () => {
		const manager = new BackgroundProcessManager();
		await manager.close();

		expect(
			manager.add(async () => Promise.resolve('This should never be returned.'))
		).rejects.toThrow('BackgroundManagerNotOpenError');
	});

	test('can be explicitly re-opened to accept new work after close()', async () => {
		const manager = new BackgroundProcessManager();
		await manager.close();
		await manager.open();

		const value = await manager.add(async () => Promise.resolve('VALUE'));
		expect(value).toEqual('VALUE');
	});

	test('can be explicitly re-opened while isClosing to accept new work after close', async () => {
		const manager = new BackgroundProcessManager();

		// add a job that will not have completed by the time we open() again
		manager.add(async () => new Promise(unsleep => setTimeout(unsleep, 10)));

		// close, but don't want, because we want to prove that open() will wait
		// internally for close to resolve before re-opening.
		manager.close();

		// should not fail:
		await manager.open();
		const value = await manager.add(async () => Promise.resolve('VALUE'));

		// and per usual, return value from the op should be passed through.
		expect(value).toEqual('VALUE');
	});

	test('can be safely "opened" while already opened (open is behaviorally idempotent)', async () => {
		const manager = new BackgroundProcessManager();
		manager.open();
		await manager.open();
		const value = await manager.add(async () => Promise.resolve('VALUE'));
		expect(value).toEqual('VALUE');
	});

	test('tracks state throughout lifecycle', async () => {
		const manager = new BackgroundProcessManager();

		expect(manager.state).toEqual(BackgroundProcessManagerState.Open);
		expect(manager.isOpen).toBe(true);
		expect(manager.isClosing).toBe(false);
		expect(manager.isClosed).toBe(false);

		let unblock;
		manager.add(async () => new Promise(_unblock => (unblock = _unblock)));

		expect(manager.state).toEqual(BackgroundProcessManagerState.Open);
		expect(manager.isOpen).toBe(true);
		expect(manager.isClosing).toBe(false);
		expect(manager.isClosed).toBe(false);

		manager.close();

		expect(manager.state).toEqual(BackgroundProcessManagerState.Closing);
		expect(manager.isOpen).toBe(false);
		expect(manager.isClosing).toBe(true);
		expect(manager.isClosed).toBe(false);

		// "unblock" returns immediately, so we need to give control back to
		// promise layers handling by awaiting another promise before the
		// manager can register completion.

		unblock();
		await new Promise(resume => setImmediate(resume));

		expect(manager.state).toEqual(BackgroundProcessManagerState.Closed);
		expect(manager.isOpen).toBe(false);
		expect(manager.isClosing).toBe(false);
		expect(manager.isClosed).toBe(true);
	});

	test('JobmanagerStates states are human readable strings', () => {
		expect(BackgroundProcessManagerState.Open).toEqual('Open');
		expect(BackgroundProcessManagerState.Closing).toEqual('Closing');
		expect(BackgroundProcessManagerState.Closed).toEqual('Closed');
	});

	test('blocked jobs are async catchable', async () => {
		const manager = new BackgroundProcessManager();
		await manager.close();

		await manager
			.add(async () => Promise.resolve('This should never be returned.'))
			.then(() => {
				expect(true).toBe(false);
			})
			.catch(error => {
				expect(error.message).toContain('BackgroundManagerNotOpenError');
			});
	});

	test('waits for multiple promises', async () => {
		const manager = new BackgroundProcessManager();

		const results: boolean[] = [];

		for (let i = 0; i < 10; i++) {
			const _i = i;
			results.push(false);
			manager.add(async () => {
				return new Promise(resolve => {
					setTimeout(() => {
						results[_i] = true;
						resolve();
					}, 5 * _i);
				});
			});
		}

		await manager.close();

		expect(results.length).toEqual(10); // sanity check
		expect(results.every(v => v === true)).toBe(true);
	});

	test('can send termination signals to jobs that support termination, with resolve', async () => {
		let completed = false;
		const manager = new BackgroundProcessManager();

		const resultPromise = manager.add(async onTerminate => {
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
		expect(manager.length).toBe(1);
		await manager.close();

		// after close(), the job should be cleared
		expect(manager.length).toBe(0);

		// giving a wait, to make sure the job doesn't actually fire
		// after being cleared with close()
		await new Promise(resolve => setTimeout(resolve, 100));

		// then making sure the job really really didn't fire.
		expect(completed).toBe(false);
	});

	test('can send termination signals to jobs that support termination, with reject', async () => {
		let completed = false;
		let thrown = undefined;
		const manager = new BackgroundProcessManager();

		const resultPromise = manager.add(async onTerminate => {
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
		expect(manager.length).toBe(1);

		const results = await manager.close();
		expect(results[0].status).toEqual('rejected');

		// after close(), the job should be cleared
		expect(manager.length).toBe(0);

		// giving a wait, to make sure the job doesn't actually fire
		// after being cleared with close()
		await new Promise(resolve => setTimeout(resolve, 100));

		// then making sure the job really really didn't fire.
		expect(completed).toBe(false);
		expect(thrown).toEqual('badness happened');
	});

	test('attempts to terminate all, but patiently waits for persistent jobs', async () => {
		const manager = new BackgroundProcessManager();

		let terminationAttemptCount = 0;
		const results: boolean[] = [];

		for (let i = 0; i < 10; i++) {
			const _i = i;
			results.push(false);
			manager.add(async onTerminate => {
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
							// needs resolve/reject to unblock `close()`.
							_i > 5 ? resolve() : reject();
						}
					});
				});
			});
		}

		// capture resolutions so we can ensure we actually tested this with a
		// mix of resolves and rejects.
		const resolutions = await manager.close();

		expect(results.length).toEqual(10); // sanity check
		expect(results.filter(v => v === true).length).toBe(5);
		expect(terminationAttemptCount).toEqual(10);
		expect(resolutions.filter(r => r.status === 'rejected').length).toEqual(3);
	});

	test('can be used to terminate other types of bg jobs, like zen subscriptions', async () => {
		const manager = new BackgroundProcessManager();
		let count = 0;

		// we could also put the manager.job() outside the observable and call
		// unsubscribe() on the subscription. all depends where the control
		// needs to occur. this example explicitly intends to demonstrate
		// that the observable constructor can manage it like a hook.
		new Observable(observer => {
			const { resolve, onTerminate } = manager.add();
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
		await manager.close();
		const countSnapshot = count;

		expect(count).toBeGreaterThan(0);

		// after a little more time, we should see that there have been no more
		// messages.
		await new Promise(resolve => setTimeout(resolve, 50));
		expect(countSnapshot).toEqual(count);
	});

	test('can provide cleanup functions for use in zen observables', async () => {
		const manager = new BackgroundProcessManager();
		let count = 0;

		const subscription = new Observable(observer => {
			const interval = setInterval(() => observer.next({}), 10);

			// LOOK: here's the magic. (tada!)
			return manager.addCleaner(async () => {
				clearInterval(interval);
			});
		}).subscribe(() => count++);

		await new Promise(resolve => setTimeout(resolve, 50));

		// this should signal to termination and end, and the observable should
		// respond by calling its internal terminate().
		await manager.close();
		const countSnapshot = count;

		expect(count).toBeGreaterThan(0);

		// after a little more time, we should see that there have been no more
		// messages.
		await new Promise(resolve => setTimeout(resolve, 50));
		expect(countSnapshot).toEqual(count);
	});

	test('cleaner is resolved when used as zen cleaner and subscription is unsubscribed', async () => {
		const manager = new BackgroundProcessManager();
		let count = 0;

		const subscription = new Observable(observer => {
			const interval = setInterval(() => observer.next({}), 10);

			// LOOK: here's the magic. (tada!)
			return manager.addCleaner(async () => {
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
		expect(manager.length).toEqual(0);

		// it's good practice always to close() your job managers.
		await manager.close();
	});

	test('close() is idempotent, firing onTerminate signals only once', async () => {
		// As long as `onTerminate` is implemented as a `Promise`, this is kind
		// if a silly test, because promises are idempontent. But, it's still
		// an important test to guard against regressions if we stop using a
		// `Promise` for `onTerminate` later.

		const manager = new BackgroundProcessManager();

		let terminateSignalCount = 0;

		manager.add(
			async onTerminate =>
				new Promise(resolve => {
					// don't actually resolve right away to ensure there is
					// "opportunity" for `onTerminate` to trigger more than
					// once if it is implemented wrong.
					onTerminate.then(() => {
						terminateSignalCount++;
						setTimeout(resolve, 150);
					});
				})
		);

		// accumulate a bunch of close promises, only the first of which should
		// send the close signal, but all of which should await resolution.
		const closes = [0, 1, 2, 3, 4, 5].map(i => manager.close());

		// ensure everything has settled
		const resolved = await Promise.allSettled(closes);

		expect(terminateSignalCount).toEqual(1);
		expect(resolved.map(r => r.status).every(v => v === 'fulfilled')).toBe(
			true
		);
	});

	test('can contain a nested manager', async () => {
		const outer = new BackgroundProcessManager();
		const inner = new BackgroundProcessManager();

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

		await outer.close();

		expect(proof).toBe(true);
	});

	test('calls inner manager close upon outer manager close', async () => {
		const outer = new BackgroundProcessManager();
		const inner = new BackgroundProcessManager();

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

		await outer.close();

		expect(proof).toBe(true);
	});

	test('jobs can be named when adding an async function', async () => {
		const manager = new BackgroundProcessManager();

		manager.add(
			async () => new Promise(unsleep => setTimeout(unsleep, 1)),
			'async function'
		);

		expect(manager.pending.length).toBe(1);
		expect(manager.pending[0]).toEqual('async function');

		// always close your managers :)
		await manager.close();
	});

	test('jobs can be named when adding a cancelable async function', async () => {
		const manager = new BackgroundProcessManager();

		manager.add(
			async onTerminate =>
				new Promise(finishJob => {
					onTerminate.then(finishJob);
				}),
			'cancelable async function'
		);

		expect(manager.pending.length).toBe(1);
		expect(manager.pending[0]).toEqual('cancelable async function');

		// always close your managers :)
		await manager.close();
	});

	test('jobs can be named when getting job hooks', async () => {
		const manager = new BackgroundProcessManager();

		const { resolve } = manager.add('job hooks');

		expect(manager.pending.length).toBe(1);
		expect(manager.pending[0]).toEqual('job hooks');

		// always close your managers :)
		resolve();
		await manager.close();
	});

	test('sub-managers can be named', async () => {
		const inner = new BackgroundProcessManager();
		const outer = new BackgroundProcessManager();

		outer.add(inner, 'inner manager');

		expect(outer.pending.length).toBe(1);
		expect(outer.pending[0]).toEqual('inner manager');

		await outer.close();
	});

	test('cleaners can be named', async () => {
		const manager = new BackgroundProcessManager();

		manager.addCleaner(async () => {
			// no op
		}, 'cleaner name');

		expect(manager.pending.length).toBe(1);
		expect(manager.pending[0]).toEqual('cleaner name');

		await manager.close();
	});

	test('manager closed error for named additions shows name in error', async () => {
		const manager = new BackgroundProcessManager();
		await manager.close();

		await expect(manager.add(async () => {}, 'some job')).rejects.toThrow(
			'some job'
		);
	});

	test('manager closed error shows names of pending items in error', async () => {
		const manager = new BackgroundProcessManager();

		let unblock;
		manager.add(
			() => new Promise(_unblock => (unblock = _unblock)),
			'blocking job'
		);

		const close = manager.close();

		await expect(manager.add(async () => {}, 'some job')).rejects.toThrow(
			'blocking job'
		);

		unblock();
		await close;
	});
});

describe('allSettled', () => {
	test('custom allSettled return value equals Promise.allSettled return value', async () => {
		const promises = [Promise.resolve('foo'), Promise.reject('bar')];
		const builtIn = await Promise.allSettled(promises);
		const custom = await allSettled(promises);
		expect(builtIn).toEqual(custom);
	});

	test('custom allSettled functions as promise', async () => {
		const promises = [Promise.resolve('foo'), Promise.reject('bar')];

		await expect(allSettled(promises)).resolves.toMatchInlineSnapshot(`
					Array [
					  Object {
					    "status": "fulfilled",
					    "value": "foo",
					  },
					  Object {
					    "reason": "bar",
					    "status": "rejected",
					  },
					]
				`);
	});
});
