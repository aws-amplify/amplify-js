import { ServiceWorker } from '../src';

describe('ServiceWorker test', () => {
	describe('Error conditions', () => {
		test('fails when serviceworker not available', () => {
			const serviceWorker = new ServiceWorker();

			return expect(serviceWorker.register()).rejects.toThrow(
				'Service Worker not available'
			);
		});
		test('fails when enablePush and serviceworker is not registered', () => {
			const serviceWorker = new ServiceWorker();
			const enablePush = () => {
				serviceWorker.enablePush('publicKey');
			};

			return expect(enablePush).toThrow('Service Worker not registered');
		});
		test('fails when registering', async () => {
			(global as any).navigator.serviceWorker = {
				register: () => Promise.reject('an error'),
			};

			const serviceWorker = new ServiceWorker();

			try {
				await serviceWorker.register();
			} catch (e) {
				expect(e).toEqual('an error');
			}
		});
	});
	describe('Register with status', () => {
		const statuses = ['installing', 'waiting', 'active'];
		statuses.forEach(status => {
			test(`can register (${status})`, () => {
				const bla = { [status]: { addEventListener: () => {} } };
				(global as any).navigator.serviceWorker = {
					register: () => Promise.resolve(bla),
				};

				const serviceWorker = new ServiceWorker();

				return expect(serviceWorker.register()).resolves.toBe(bla);
			});
		});

		statuses.forEach(status => {
			test(`listeners are added (${status})`, async () => {
				const bla = {
					[status]: { addEventListener: jest.fn() },
				};

				(global as any).navigator.serviceWorker = {
					register: () => Promise.resolve(bla),
				};

				const serviceWorker = new ServiceWorker();
				await serviceWorker.register();

				return expect(bla[status].addEventListener).toHaveBeenCalledTimes(2);
			});
		});
	});
	describe('Send messages', () => {
		test('no message is sent if not registered', () => {
			const bla = {
				installing: { postMessage: jest.fn(), addEventListener: jest.fn() },
			};

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve(bla),
			};

			const serviceWorker = new ServiceWorker();

			serviceWorker.send('A message');

			return expect(bla.installing.postMessage).toHaveBeenCalledTimes(0);
		});
		test('can send string message after registration', async () => {
			const bla = {
				installing: { postMessage: jest.fn(), addEventListener: jest.fn() },
			};

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve(bla),
			};

			const serviceWorker = new ServiceWorker();
			await serviceWorker.register();

			serviceWorker.send('A message');

			return expect(bla.installing.postMessage).toBeCalledWith('A message');
		});
		test('can send object message after registration', async () => {
			const bla = {
				installing: { postMessage: jest.fn(), addEventListener: jest.fn() },
			};

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve(bla),
			};

			const serviceWorker = new ServiceWorker();
			await serviceWorker.register();

			serviceWorker.send({ property: 'value' });

			return expect(bla.installing.postMessage).toBeCalledWith(
				JSON.stringify({ property: 'value' })
			);
		});
	});
	describe('Enable push', () => {
		test('can enable push when user is subscribed', async () => {
			const subscription = {};

			const bla = {
				installing: { addEventListener: jest.fn() },
				pushManager: {
					getSubscription: jest
						.fn()
						.mockReturnValue(Promise.resolve(subscription)),
				},
			};

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve(bla),
			};

			const serviceWorker = new ServiceWorker();
			await serviceWorker.register();

			return expect(serviceWorker.enablePush('publickKey')).resolves.toBe(
				subscription
			);
		});
		test('can enable push when user is not subscribed', async () => {
			const subscription = null;

			const bla = {
				installing: { addEventListener: jest.fn() },
				pushManager: {
					getSubscription: jest.fn().mockReturnValue(Promise.resolve(null)),
					subscribe: jest.fn().mockReturnValue(Promise.resolve(subscription)),
				},
			};

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve(bla),
			};

			const serviceWorker = new ServiceWorker();
			await serviceWorker.register();

			return expect(serviceWorker.enablePush('publickKey')).resolves.toBe(
				subscription
			);
		});
	});
});
