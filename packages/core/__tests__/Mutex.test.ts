/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Christian Speckner <cnspeckn@googlemail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { Mutex } from '../src/Mutex';

describe('Mutex', () => {
	let mutex: Mutex;

	beforeEach(() => (mutex = new Mutex()));

	test('ownership is exclusive', () => {
		let flag = false;

		mutex.acquire().then(release =>
			setTimeout(() => {
				flag = true;
				release();
			}, 50),
		);

		return mutex.acquire().then(release => {
			release();

			expect(flag).toBe(true);
		});
	});

	test('runExclusive passes result (immediate)', () => {
		return mutex
			.runExclusive<number>(() => 10)
			.then(value => {
				expect(value).toBe(10);
			});
	});

	test('runExclusive passes result (promise)', () => {
		return mutex
			.runExclusive<number>(() => Promise.resolve(10))
			.then(value => {
				expect(value).toBe(10);
			});
	});

	test('runExclusive passes rejection', () => {
		const expectedError = new Error('foo');

		return mutex
			.runExclusive<number>(() => Promise.reject(expectedError))
			.then(
				() => Promise.reject(new Error('should have been rejected')),
				value => {
					expect(value).toBe(expectedError);
				},
			);
	});

	test('runExclusive passes exception', () => {
		const expectedError = new Error('foo');

		return mutex
			.runExclusive<number>(() => {
				throw expectedError;
			})
			.then(
				() => Promise.reject(new Error('should have been rejected')),
				value => {
					expect(value).toBe(expectedError);
				},
			);
	});

	test('runExclusive is exclusive', () => {
		let flag = false;

		mutex.runExclusive(
			() =>
				new Promise<void>(resolve =>
					setTimeout(() => {
						flag = true;
						resolve();
					}, 50),
				),
		);

		return mutex.runExclusive(() => {
			expect(flag).toBe(true);
		});
	});

	test('exceptions during runExclusive do not leave mutex locked', () => {
		let flag = false;

		mutex
			.runExclusive<number>(() => {
				flag = true;
				throw new Error();
			})
			.then(
				() => undefined,
				() => undefined,
			);

		return mutex.runExclusive(() => {
			expect(flag).toBe(true);
		});
	});

	test('new mutex is unlocked', () => {
		expect(!mutex.isLocked()).toBe(true);
	});

	test('isLocked reflects the mutex state', async () => {
		const lock1 = mutex.acquire();
		const lock2 = mutex.acquire();

		expect(mutex.isLocked()).toBe(true);

		const releaser1 = await lock1;

		expect(mutex.isLocked()).toBe(true);

		releaser1();

		expect(mutex.isLocked()).toBe(true);

		const releaser2 = await lock2;

		expect(mutex.isLocked()).toBe(true);

		releaser2();

		expect(!mutex.isLocked()).toBe(true);
	});
});
