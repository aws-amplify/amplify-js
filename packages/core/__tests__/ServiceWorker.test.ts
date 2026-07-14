import { AmplifyError } from '../src/libraryUtils';
import { ServiceWorker } from '../src';
import { ServiceWorkerErrorCode } from '../src/ServiceWorker/errorHelpers';
import { record } from '../src/providers/pinpoint';
import { Amplify, fetchAuthSession } from '../src/singleton';
import { ConsoleLogger } from '../src/Logger';

jest.mock('../src/providers/pinpoint');
jest.mock('../src/singleton/apis/fetchAuthSession');

describe('ServiceWorker test', () => {
	describe('Error conditions', () => {
		test('fails when serviceworker not available', () => {
			const serviceWorker = new ServiceWorker();

			return expect(serviceWorker.register()).rejects.toThrow(
				'Service Worker not available',
			);
		});
		test('fails when enablePush and serviceworker is not registered', () => {
			const serviceWorker = new ServiceWorker();
			const enablePush = () => {
				serviceWorker.enablePush('publicKey');
			};

			expect(enablePush).toThrow(AmplifyError);
		});
		test('fails when registering', async () => {
			(global as any).navigator.serviceWorker = {
				register: () => Promise.reject(new Error('an error')),
			};

			const serviceWorker = new ServiceWorker();

			try {
				await serviceWorker.register();
			} catch (e: any) {
				expect(e).toBeInstanceOf(AmplifyError);
				expect(e.name).toBe(ServiceWorkerErrorCode.Unavailable);
			}
		});
	});
	describe('Register with status', () => {
		const statuses = ['installing', 'waiting', 'active'];
		statuses.forEach(status => {
			test(`can register (${status})`, () => {
				const bla = {
					[status]: {
						addEventListener: jest.fn(),
					},
				};
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

				expect(bla[status].addEventListener).toHaveBeenCalledTimes(2);
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

			expect(bla.installing.postMessage).toHaveBeenCalledTimes(0);
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

			expect(bla.installing.postMessage).toHaveBeenCalledWith('A message');
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

			expect(bla.installing.postMessage).toHaveBeenCalledWith(
				JSON.stringify({ property: 'value' }),
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
				subscription,
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
				subscription,
			);
		});
	});
	describe('State change telemetry', () => {
		const pinpointConfig = {
			appId: 'test-app-id',
			region: 'us-east-1',
			bufferSize: 100,
			flushInterval: 1000,
			flushSize: 10,
			resendLimit: 5,
		};
		const credentials = {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		};

		const registerAndGetStateChangeHandler = async (
			onStateChange?: (state: ServiceWorkerState) => void,
		): Promise<() => Promise<void>> => {
			const mockServiceWorker = {
				state: 'activated' as ServiceWorkerState,
				addEventListener: jest.fn(),
			};

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve({ installing: mockServiceWorker }),
			};

			const serviceWorker = new ServiceWorker();
			await serviceWorker.register(
				'/service-worker.js',
				'/',
				onStateChange ? { onStateChange } : undefined,
			);

			const [, stateChangeHandler] =
				mockServiceWorker.addEventListener.mock.calls.find(
					call => call[0] === 'statechange',
				) ?? [];

			return stateChangeHandler;
		};

		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure({
				Analytics: { Pinpoint: pinpointConfig },
			});
			(fetchAuthSession as jest.Mock).mockResolvedValue({ credentials });
		});

		afterAll(() => {
			jest.restoreAllMocks();
		});

		test('records a Pinpoint event when no onStateChange handler is provided', async () => {
			const handleStateChange = await registerAndGetStateChangeHandler();

			await handleStateChange();

			expect(record).toHaveBeenCalledTimes(1);
			expect(record).toHaveBeenCalledWith(
				expect.objectContaining({
					appId: pinpointConfig.appId,
					region: pinpointConfig.region,
					category: 'Core',
					credentials,
					event: {
						name: 'ServiceWorker',
						attributes: { state: 'activated' },
					},
				}),
			);
		});

		test('invokes onStateChange and suppresses built-in recording when a handler is provided', async () => {
			const onStateChange = jest.fn();
			const handleStateChange =
				await registerAndGetStateChangeHandler(onStateChange);
			// Ignore the initial-state emit fired during register(); this test
			// isolates the statechange-listener path (covered separately below).
			onStateChange.mockClear();

			await handleStateChange();

			expect(onStateChange).toHaveBeenCalledTimes(1);
			expect(onStateChange).toHaveBeenCalledWith('activated');
			// The provided handler overrides the built-in path: no double-recording.
			expect(fetchAuthSession).not.toHaveBeenCalled();
			expect(record).not.toHaveBeenCalled();
		});

		test('does not record when Pinpoint is not configured and no handler is provided', async () => {
			Amplify.configure({});
			const handleStateChange = await registerAndGetStateChangeHandler();

			await handleStateChange();

			expect(record).not.toHaveBeenCalled();
		});

		test('logs and swallows errors thrown by the onStateChange handler', async () => {
			const errorSpy = jest
				.spyOn(ConsoleLogger.prototype, 'error')
				.mockImplementation(() => undefined);
			const thrown = new Error('handler boom');
			const onStateChange = jest.fn(() => {
				throw thrown;
			});
			const handleStateChange =
				await registerAndGetStateChangeHandler(onStateChange);
			// Ignore the initial-state emit fired during register().
			onStateChange.mockClear();
			errorSpy.mockClear();

			// A throwing handler must not reject out of the async listener.
			await expect(handleStateChange()).resolves.toBeUndefined();

			expect(onStateChange).toHaveBeenCalledWith('activated');
			expect(errorSpy).toHaveBeenCalledWith(
				'onStateChange handler threw',
				thrown,
			);
			// The built-in path stays suppressed even when the handler throws.
			expect(record).not.toHaveBeenCalled();

			errorSpy.mockRestore();
		});

		test('logs and swallows errors thrown by an async onStateChange handler', async () => {
			const errorSpy = jest
				.spyOn(ConsoleLogger.prototype, 'error')
				.mockImplementation(() => undefined);
			const thrown = new Error('async handler boom');
			const onStateChange = jest.fn(async () => {
				throw thrown;
			});
			const handleStateChange =
				await registerAndGetStateChangeHandler(onStateChange);
			// Let the initial-state emit's async rejection settle, then ignore it.
			await new Promise(resolve => setTimeout(resolve, 0));
			onStateChange.mockClear();
			errorSpy.mockClear();

			// An async handler that rejects must not reject out of the async
			// listener (the listener awaits the handler inside the try/catch).
			await expect(handleStateChange()).resolves.toBeUndefined();

			expect(onStateChange).toHaveBeenCalledWith('activated');
			expect(errorSpy).toHaveBeenCalledWith(
				'onStateChange handler threw',
				thrown,
			);
			// The built-in path stays suppressed even when the handler rejects.
			expect(record).not.toHaveBeenCalled();

			errorSpy.mockRestore();
		});

		test('invokes the handler once per statechange event', async () => {
			const onStateChange = jest.fn();
			const handleStateChange =
				await registerAndGetStateChangeHandler(onStateChange);
			// Ignore the initial-state emit fired during register().
			onStateChange.mockClear();

			await handleStateChange();
			await handleStateChange();
			await handleStateChange();

			expect(onStateChange).toHaveBeenCalledTimes(3);
			expect(record).not.toHaveBeenCalled();
		});

		test('captures the handler per registration so re-register does not re-target a prior listener', async () => {
			const handlerA = jest.fn();
			const handlerB = jest.fn();
			const workerA = {
				state: 'activated' as ServiceWorkerState,
				addEventListener: jest.fn(),
			};
			const workerB = {
				state: 'activated' as ServiceWorkerState,
				addEventListener: jest.fn(),
			};
			const serviceWorker = new ServiceWorker();

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve({ installing: workerA }),
			};
			await serviceWorker.register('/service-worker.js', '/', {
				onStateChange: handlerA,
			});

			(global as any).navigator.serviceWorker = {
				register: () => Promise.resolve({ installing: workerB }),
			};
			await serviceWorker.register('/service-worker.js', '/', {
				onStateChange: handlerB,
			});

			// Both registrations fire an initial-state emit; ignore those here so
			// this test isolates the per-listener capture behavior.
			handlerA.mockClear();
			handlerB.mockClear();

			const [, listenerA] =
				workerA.addEventListener.mock.calls.find(
					call => call[0] === 'statechange',
				) ?? [];

			await listenerA();

			// The first listener keeps its own captured handler even after a
			// second registration swapped the instance's current handler.
			expect(handlerA).toHaveBeenCalledTimes(1);
			expect(handlerA).toHaveBeenCalledWith('activated');
			expect(handlerB).not.toHaveBeenCalled();
			expect(record).not.toHaveBeenCalled();
		});

		test('emits the current state to the handler on register when the worker is already in a state', async () => {
			const onStateChange = jest.fn();

			// registerAndGetStateChangeHandler resolves after register() completes;
			// the initial-state emit runs synchronously during _setupListeners, so
			// the handler has already been notified with the current state without
			// any statechange event being dispatched.
			await registerAndGetStateChangeHandler(onStateChange);

			expect(onStateChange).toHaveBeenCalledTimes(1);
			expect(onStateChange).toHaveBeenCalledWith('activated');
			// The initial emit must NOT trigger the built-in Pinpoint path; that
			// path stays unchanged for consumers that do not pass a handler.
			expect(fetchAuthSession).not.toHaveBeenCalled();
			expect(record).not.toHaveBeenCalled();
		});

		test('does not record to Pinpoint on register when no handler is provided (no initial emit)', async () => {
			// Without a handler there is no initial emit, and the built-in path is
			// only exercised on an actual statechange event, not on register().
			await registerAndGetStateChangeHandler();

			expect(record).not.toHaveBeenCalled();
		});
	});
});
