jest.mock('@aws-amplify/core', () => ({
	__esModule: true,
	...jest.requireActual('@aws-amplify/core'),
	browserOrNode() {
		return {
			isBrowser: true,
			isNode: false,
		};
	},
	fetchAuthSession() {
		return {
			credentials: {
				accessKeyId: 'accessKeyId',
				sessionToken: 'sessionToken',
				secretAccessKey: 'secretAccessKey',
				identityId: 'identityId',
				authenticated: true,
			},
		};
	},
}));

import { Reachability } from '@aws-amplify/core/internals/utils';
import * as Paho from '../src/vendor/paho-mqtt';
import { ConnectionState, PubSub as IotPubSub, mqttTopicMatch } from '../src';
import { PubSub as MqttPubSub } from '../src/clients/mqtt';
import { HubConnectionListener } from './helpers';
import { Observable, Observer } from 'rxjs';
import * as constants from '../src/Providers/constants';

const pahoClientMockCache = {};

const mockConnect = jest.fn(options => {
	options.onSuccess();
});

const pahoClientMock = jest.fn().mockImplementation((host, clientId) => {
	if (pahoClientMockCache[clientId]) {
		return pahoClientMockCache[clientId];
	}

	var client = {} as any;

	client.connect = mockConnect;
	client.send = jest.fn((topic, message) => {
		client.onMessageArrived({ destinationName: topic, payloadString: message });
	});
	client.subscribe = jest.fn((topics, options) => {});
	client.unsubscribe = jest.fn(() => {});
	client.onMessageArrived = jest.fn(() => {});

	client.isConnected = jest.fn(() => true);
	client.disconnect = jest.fn(() => {});

	pahoClientMockCache[clientId] = client;

	return client;
});

jest.mock('../src/vendor/paho-mqtt', () => ({
	__esModule: true,
	...jest.requireActual('../src/vendor/paho-mqtt'),
	Client: {},
}));

// @ts-ignore
Paho.Client = pahoClientMock;

const testPubSubAsync = (
	pubsub,
	topic,
	message,
	options?,
	hubConnectionListener?,
) =>
	new Promise(async (resolve, reject) => {
		if (hubConnectionListener === undefined) {
			hubConnectionListener = new HubConnectionListener('pubsub');
		}
		const obs = pubsub.subscribe({ topics: topic, options }).subscribe({
			next: data => {
				expect(data).toEqual(message);
				obs.unsubscribe();
				resolve(Promise.resolve());
			},
			close: () => console.log('close'),
			error: reject,
		});
		await hubConnectionListener.waitUntilConnectionStateIn([
			ConnectionState.Connected,
		]);
		pubsub.publish({ topics: topic, message: message, options });
	});

beforeEach(() => {
	// Reduce retry delay for tests to 100ms
	Object.defineProperty(constants, 'RECONNECT_DELAY', {
		value: 100,
	});
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('PubSub', () => {
	// extend class for testing
	class MqttPubSubTest extends MqttPubSub {
		disconnect = this.disconnect;
	}

	describe('constructor test', () => {
		test('happy case', () => {
			const pubsub = new IotPubSub();
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const pubsub = new IotPubSub();

			const options = {
				key: 'value',
			};

			const config = pubsub.configure(options);
			expect(config).toMatchObject(options);
		});

		test('should accept PubSub key in configuration object', () => {
			const pubsub = new IotPubSub();

			const options = {
				PubSub: {
					key: 'value',
				},
			};

			const config = pubsub.configure(options);
			expect(config).toMatchObject(options);
		});
	});

	describe('AWSIoTProvider', () => {
		test('subscribe and publish to the same topic using AWSIoTProvider', async () => {
			expect.assertions(1);

			let hubConnectionListener = new HubConnectionListener('pubsub');

			const config = {
				PubSub: {
					region: 'region',
					endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
				},
			};
			const pubsub = new IotPubSub(config.PubSub);

			const expectedData = {
				value: 'my message',
			};

			pubsub.subscribe({ topics: 'topicA' }).subscribe({
				next: data => {
					expect(data).toMatchObject(expectedData);
				},
				complete: () => console.log('done'),
				error: error => console.log('error', error),
			});

			await hubConnectionListener.waitUntilConnectionStateIn([
				ConnectionState.Connected,
			]);

			await pubsub.publish({
				topics: 'topicA',
				message: { value: 'my message' },
			});
		});

		test('subscriber is matching MQTT topic wildcards', () => {
			const publishTopic = 'topic/A/B/C';
			expect(mqttTopicMatch('topic/A/B/C', publishTopic)).toBe(true);
			expect(mqttTopicMatch('topic/A/#', publishTopic)).toBe(true);
			expect(mqttTopicMatch('topic/A/+/C', publishTopic)).toBe(true);
			expect(mqttTopicMatch('topic/A/+/#', publishTopic)).toBe(true);
			expect(mqttTopicMatch('topic/A/B/C/#', publishTopic)).toBe(false);
		});

		test('should remove AWSIoTProvider', () => {
			const pubsubClient = new IotPubSub({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});
			jest.spyOn(pubsubClient, 'publish');
			const newPubsubClient = new IotPubSub({
				region: 'new-region',
				endpoint: 'wss://iot.newEndPoint.org:443/newEndPoint',
			});
			jest.spyOn(newPubsubClient, 'publish');

			newPubsubClient.publish({
				topics: 'someTopic',
				message: { msg: 'published Message' },
			});

			expect(pubsubClient.publish).not.toHaveBeenCalled();
			expect(newPubsubClient.publish).toHaveBeenCalled();
		});
	});

	describe('MqttOverWSProvider', () => {
		test('trigger observer error when connect failed', () => {
			const pubsub = new MqttPubSubTest({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});

			jest
				.spyOn<MqttPubSub, any>(MqttPubSub.prototype, 'connect')
				.mockImplementationOnce(async () => {
					throw new Error('Failed to connect to the network');
				});

			expect(
				testPubSubAsync(pubsub, 'topicA', 'my message AWSIoTProvider', {
					provider: 'AWSIoTProvider',
				}),
			).rejects.toMatchObject({
				error: new Error('Failed to connect to the network'),
			});
		});

		test('trigger reconnection when disconnected', async () => {
			let hubConnectionListener = new HubConnectionListener('pubsub');
			const pubsub = new MqttPubSubTest({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});

			pubsub
				.subscribe({ topics: 'topic', options: { clientId: '123' } })
				.subscribe({});
			await hubConnectionListener.waitUntilConnectionStateIn([
				ConnectionState.Connected,
			]);

			pubsub.onDisconnect({ errorCode: 1, clientId: '123' });
			await hubConnectionListener.waitUntilConnectionStateIn([
				ConnectionState.ConnectionDisrupted,
			]);
			await hubConnectionListener.waitUntilConnectionStateIn([
				ConnectionState.Connected,
			]);
			expect(hubConnectionListener.observedConnectionStates).toEqual([
				ConnectionState.Disconnected,
				ConnectionState.Connecting,
				ConnectionState.Connected,
				ConnectionState.ConnectionDisrupted,
				ConnectionState.Connecting,
				ConnectionState.Connected,
			]);
		});

		test('should remove MqttOverWSProvider', () => {
			const pubsubClient = new MqttPubSubTest({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});
			jest.spyOn(pubsubClient, 'publish');
			const newPubsubClient = new MqttPubSubTest({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});
			jest.spyOn(newPubsubClient, 'publish');

			newPubsubClient.publish({
				topics: 'someTopic',
				message: { msg: 'published Message' },
			});

			expect(pubsubClient.publish).not.toHaveBeenCalled();
			expect(newPubsubClient.publish).toHaveBeenCalled();
		});

		describe('Hub connection state changes', () => {
			let hubConnectionListener: HubConnectionListener;

			let reachabilityObserver: Observer<any>;

			beforeEach(() => {
				// Maintain the Hub connection listener, used to monitor the connection messages sent through Hub
				hubConnectionListener?.teardown();
				hubConnectionListener = new HubConnectionListener('pubsub');

				// Setup a mock of the reachability monitor where the initial value is online.
				const spyon = jest
					.spyOn(Reachability.prototype, 'networkMonitor')
					.mockImplementationOnce(
						() =>
							// @ts-ignore
							new Observable(observer => {
								reachabilityObserver = observer;
							}),
					)
					// Twice because we subscribe to get the initial state then again to monitor reachability
					.mockImplementationOnce(
						() =>
							// @ts-ignore
							new Observable(observer => {
								reachabilityObserver = observer;
							}),
					);
				reachabilityObserver?.next?.({ online: true });
			});

			test('test happy case connect -> disconnect cycle', async () => {
				const pubsub = new IotPubSub({
					region: 'region',
					endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
				});

				const sub = pubsub
					.subscribe({ topics: 'topic', options: { clientId: '123' } })
					.subscribe({
						error: () => {},
					});

				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.Connected,
				]);
				sub.unsubscribe();
				pubsub.onDisconnect({ errorCode: 1, clientId: '123' });
				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.Disconnected,
				]);
				expect(hubConnectionListener.observedConnectionStates).toEqual([
					ConnectionState.Disconnected,
					ConnectionState.Connecting,
					ConnectionState.Connected,
					ConnectionState.ConnectedPendingDisconnect,
					ConnectionState.Disconnected,
				]);
			});

			test('test network disconnection and recovery', async () => {
				const pubsub = new IotPubSub({
					region: 'region',
					endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
				});

				const sub = pubsub
					.subscribe({ topics: 'topic', options: { clientId: '123' } })
					.subscribe({
						error: () => {},
					});

				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.Connected,
				]);

				reachabilityObserver?.next?.({ online: false });
				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.ConnectedPendingNetwork,
				]);

				reachabilityObserver?.next?.({ online: true });
				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.Connected,
				]);

				expect(hubConnectionListener.observedConnectionStates).toEqual([
					ConnectionState.Disconnected,
					ConnectionState.Connecting,
					ConnectionState.Connected,
					ConnectionState.ConnectedPendingNetwork,
					ConnectionState.Connected,
				]);
			});

			test('test network disconnection followed by connection disruption', async () => {
				const pubsub = new IotPubSub({
					region: 'region',
					endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
				});

				const sub = pubsub
					.subscribe({ topics: 'topic', options: { clientId: '123' } })
					.subscribe({
						error: () => {},
					});

				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.Connected,
				]);

				reachabilityObserver?.next?.({ online: false });
				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.ConnectedPendingNetwork,
				]);

				pubsub.onDisconnect({ errorCode: 1, clientId: '123' });
				await hubConnectionListener.waitUntilConnectionStateIn([
					ConnectionState.ConnectionDisruptedPendingNetwork,
				]);

				expect(hubConnectionListener.observedConnectionStates).toEqual([
					ConnectionState.Disconnected,
					ConnectionState.Connecting,
					ConnectionState.Connected,
					ConnectionState.ConnectedPendingNetwork,
					ConnectionState.ConnectionDisruptedPendingNetwork,
				]);
			});
		});
	});

	describe('MqttOverWSProvider local testing config', () => {
		test('ssl should be disabled in the case of local testing', async () => {
			mockConnect.mockClear();
			const pubsub = new MqttPubSubTest({
				region: 'region',
				aws_appsync_dangerously_connect_to_http_endpoint_for_testing: true,
			});

			await testPubSubAsync(pubsub, 'topicA', 'my message MqttOverWSProvider', {
				provider: 'MqttOverWSProvider',
			});

			expect(pubsub['isSSLEnabled']).toBe(false);
			expect(mockConnect).toHaveBeenCalledWith({
				useSSL: false,
				mqttVersion: 3,
				onSuccess: expect.any(Function),
				onFailure: expect.any(Function),
			});
		});
	});

	describe('multiple providers', () => {
		test('subscribe and publish to specific provider', async () => {
			const iotClient = new IotPubSub({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});

			const mqttClient = new MqttPubSubTest({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});

			let hubConnectionListener = new HubConnectionListener('pubsub');
			await testPubSubAsync(
				iotClient,
				'topicA',
				'my message AWSIoTProvider',
				{
					provider: 'AWSIoTProvider',
				},
				hubConnectionListener,
			);

			await testPubSubAsync(
				mqttClient,
				'topicA',
				'my message MqttOverWSProvider',
				{
					provider: 'MqttOverWSProvider',
				},
				hubConnectionListener,
			);
		});

		test('throw a rejected promise when publish failed by any of the provider', () => {
			const iotClient = new IotPubSub({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});

			const mqttClient = new MqttPubSubTest({
				region: 'region',
				endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt',
			});

			jest.spyOn(iotClient, 'publish').mockImplementationOnce(() => {
				return Promise.reject('Failed to publish');
			});

			expect(
				iotClient.publish({
					topics: 'topicA',
					message: { msg: 'my message AWSIoTProvider' },
				}),
			).rejects.toMatch('Failed to publish');
		});

		test('On unsubscribe when is the last observer it should disconnect the websocket', async () => {
			const hubConnectionListener = new HubConnectionListener('pubsub');
			const mqttClient = new MqttPubSubTest({
				region: 'region',
				endpoint: 'wss://iot.mock-endpoint.org:443/mqtt',
			});
			const spyDisconnect = jest.spyOn(mqttClient, 'disconnect');

			const subscription1 = mqttClient
				.subscribe({ topics: ['topic1', 'topic2'] })
				.subscribe({
					next: _data => {
						console.log({ _data });
					},
					complete: () => console.log('done'),
					error: error => console.log('error', error),
				});

			await hubConnectionListener.waitUntilConnectionStateIn([
				ConnectionState.Connected,
			]);

			subscription1.unsubscribe();

			await hubConnectionListener.waitUntilConnectionStateIn([
				ConnectionState.Disconnected,
			]);

			expect(spyDisconnect).toHaveBeenCalled();
			spyDisconnect.mockClear();
		});

		test(
			'For multiple observers, client should not be disconnected if there are ' +
				'other observers connected when unsubscribing',
			async () => {
				const pubsub = new MqttPubSubTest({
					region: 'region',
					endpoint: 'wss://iot.mock-endpoint.org:443/mqtt',
				});

				const spyDisconnect = jest.spyOn(pubsub, 'disconnect');

				const subscription1 = pubsub
					.subscribe({ topics: ['topic1', 'topic2'] })
					.subscribe({
						next: _data => {
							console.log({ _data });
						},
						complete: () => console.log('done'),
						error: error => console.log('error', error),
					});

				const subscription2 = pubsub
					.subscribe({ topics: ['topic3', 'topic4'] })
					.subscribe({
						next: _data => {
							console.log({ _data });
						},
						complete: () => console.log('done'),
						error: error => console.log('error', error),
					});

				// TODO: we should now when the connection is established to wait for that first
				await (() => {
					return new Promise(res => {
						setTimeout(res, 100);
					});
				})();

				subscription2.unsubscribe();
				expect(spyDisconnect).not.toHaveBeenCalled();
				spyDisconnect.mockClear();
			},
		);
	});
});
