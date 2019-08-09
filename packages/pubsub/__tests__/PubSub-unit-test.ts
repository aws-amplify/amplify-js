import PubSub from '../src/PubSub';
import { MqttOverWSProvider, AWSAppSyncProvider, AWSIoTProvider, mqttTopicMatch } from '../src/Providers';
// import Amplify from '../../src/';
import { Credentials } from '@aws-amplify/core';
import { INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER } from '@aws-amplify/core/lib/constants';
import * as Paho from '../src/vendor/paho-mqtt';

const pahoClientMockCache = {};

const mockConnect = jest.fn((options) => {
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
    client.subscribe = jest.fn((topics, options) => {
    });
    client.unsubscribe = jest.fn(() => {
    });
    client.onMessageArrived = jest.fn(() => {

    });

    client.isConnected = jest.fn(() => true);
    client.disconnect = jest.fn(() => {});

    pahoClientMockCache[clientId] = client;

    return client;
});

Paho.Client = pahoClientMock;

const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
}

const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
    return new Promise((res, rej) => {
        res(credentials);
    })
});

const testPubSubAsync = (
    pubsub,
    topic,
    message,
    options?,
) => new Promise((resolve, reject) => {
    const obs = pubsub.subscribe(topic, options).subscribe({
        next: (data) => {
            expect(data.value).toEqual(message);
            obs.unsubscribe();
            resolve();
        },
        close: () => console.log('close'),
        error: reject,
    });

    pubsub.publish(topic, message, options);
});

const testAppSyncAsync = (
    pubsub,
    topic,
    message,
) => new Promise((resolve, reject) => {
    const testUrl = 'wss://appsync';
    const testClientId = 'test-client';
    const testTopicAlias = 'test-topic-alias';

    const subscriptionOptions = {
        mqttConnections: [{
            topics: [topic],
            client: testClientId,
            url: testUrl,
        }],
        newSubscriptions: {
            [testTopicAlias]: { topic },
        },
    };

    const opt = {
        ...subscriptionOptions,
        provider: INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER,
    };

    const obs = pubsub.subscribe(topic, opt).subscribe({
        next: (data) => {
            expect(data.value.data[testTopicAlias]).toEqual(message);
            obs.unsubscribe();
            resolve();
        },
        close: () => console.log('close'),
        error: reject,
    });

    // simulate an AppSync update
    const testClient = new Paho.Client(testUrl, testClientId);
    testClient.send(topic, JSON.stringify({ data: { testKey: message } }));
});

describe('PubSub', () => {
    describe('constructor test', () => {
        test('happy case', () => {
            const pubsub = new PubSub({});
        });
    });

    describe('configure test', () => {
        test('happy case', () => {
            const pubsub = new PubSub({});

            const options = {
                key: 'value'
            }

            const config = pubsub.configure(options);
            expect(config).toEqual(options);
        });

        test('should accept PubSub key in configuration object', async () => {
            const pubsub = new PubSub({});

            const options = {
                PubSub: {
                    key: 'value'
                },
            }

            const config = pubsub.configure(options);
            expect(config).toEqual(options.PubSub);
        });

        test('should allow AppSync subscriptions without extra configuration', async () => {
            const pubsub = new PubSub();

            await testAppSyncAsync(pubsub, 'topicA', 'my message AWSAppSyncProvider');
        });
    });

    describe('AWSIoTProvider', () => {
        test('subscribe and publish to the same topic using AWSIoTProvider', async (done) => {
            const config = {
                PubSub: {
                    aws_pubsub_region: 'region',
                    aws_pubsub_endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt'
                }
            }
            const pubsub = new PubSub({});
            pubsub.configure(config);

            const awsIotProvider = new AWSIoTProvider();
            pubsub.addPluggable(awsIotProvider);

            expect(awsIotProvider.getCategory()).toBe('PubSub');

            const expectedData = {
                value: 'my message',
                provider: awsIotProvider
            };
            var obs = pubsub.subscribe('topicA').subscribe({
                next: (data) => {
                    expect(data).toEqual(expectedData);
                    done();
                },
                close: () => console.log('done'),
                error: error => console.log('error', error),
            });

            await pubsub.publish('topicA', 'my message');
        });

        test('subscriber is matching MQTT topic wildcards', () => {

            const publishTopic = 'topic/A/B/C';
            expect(mqttTopicMatch('topic/A/B/C', publishTopic)).toBe(true);
            expect(mqttTopicMatch('topic/A/#', publishTopic)).toBe(true);
            expect(mqttTopicMatch('topic/A/+/C', publishTopic)).toBe(true);
            expect(mqttTopicMatch('topic/A/+/#', publishTopic)).toBe(true);
            expect(mqttTopicMatch('topic/A/B/C/#', publishTopic)).toBe(false);
        });
    });

    describe('MqttOverWSProvider', () => {
        test('trigger observer error when connect failed', () => {
            const pubsub = new PubSub();

            const awsIotProvider = new AWSIoTProvider({
                aws_pubsub_region: 'region',
                aws_pubsub_endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt'
            });
            pubsub.addPluggable(awsIotProvider);

            jest.spyOn(MqttOverWSProvider.prototype, 'connect').mockImplementationOnce(async () => {
                throw new Error('Failed to connect to the network');
            });

            expect(testPubSubAsync(pubsub, 'topicA', 'my message AWSIoTProvider', {
                    provider: 'AWSIoTProvider',
            })).rejects.toMatchObject({error: new Error('Failed to connect to the network')});
        });
    });

    describe('MqttOverWSProvider local testing config', () => {
        test('ssl should be disabled in the case of local testing', async () => {
            mockConnect.mockClear();
            const pubsub = new PubSub();

            const mqttOverWSProvider = new MqttOverWSProvider({
                aws_pubsub_region: 'region',
                aws_appsync_dangerously_connect_to_http_endpoint_for_testing: true
            });
            pubsub.addPluggable(mqttOverWSProvider);
            
            await testPubSubAsync(pubsub, 'topicA', 'my message MqttOverWSProvider', {
                provider: 'MqttOverWSProvider',
            });
            
            expect(mqttOverWSProvider.isSSLEnabled).toBe(false);
            expect(mockConnect).toBeCalledWith({
                useSSL: false,
                mqttVersion: 3,
                onSuccess: expect.any(Function),
                onFailure: expect.any(Function)
            });

        });
    });

    describe('multiple providers', () => {
        test('subscribe and publish to specific provider', async () => {
            const pubsub = new PubSub();

            const awsIotProvider = new AWSIoTProvider({
                aws_pubsub_region: 'region',
                aws_pubsub_endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt'
            });
            pubsub.addPluggable(awsIotProvider);

            const awsAppSyncProvider = new AWSAppSyncProvider();
            pubsub.addPluggable(awsAppSyncProvider);

            const mqttOverWSProvider = new MqttOverWSProvider({
                aws_pubsub_endpoint: 'wss://iot.eclipse.org:443/mqtt',
            });
            pubsub.addPluggable(mqttOverWSProvider);

            expect(awsIotProvider.getCategory()).toBe('PubSub');
            expect(awsAppSyncProvider.getCategory()).toBe('PubSub');
            expect(mqttOverWSProvider.getCategory()).toBe('PubSub');

            await testPubSubAsync(pubsub, 'topicA', 'my message AWSIoTProvider', {
                provider: 'AWSIoTProvider',
            });

            await testPubSubAsync(pubsub, 'topicA', 'my message MqttOverWSProvider', {
                provider: 'MqttOverWSProvider',
            });
        });

        test('subscribe and publish to MQTT provider while also using AppSync API subscriptions', async () => {
            const pubsub = new PubSub();

            const mqttOverWSProvider = new MqttOverWSProvider({
                aws_pubsub_endpoint: 'wss://iot.eclipse.org:443/mqtt',
            });
            pubsub.addPluggable(mqttOverWSProvider);

            expect(mqttOverWSProvider.getCategory()).toBe('PubSub');

            await testAppSyncAsync(pubsub, 'topicA', 'my message AWSAppSyncProvider');

            await testPubSubAsync(pubsub, 'topicA', 'my message MqttOverWSProvider');
        });

        test('error is thrown if provider name is not found', async () => {
            const testProviderName = 'FooProvider';
            const pubsub = new PubSub();

            pubsub.addPluggable(new MqttOverWSProvider({
                aws_pubsub_endpoint: 'wss://iot.eclipse.org:443/mqtt',
            }));

            const subscribe = () => {
                pubsub.subscribe('myTopic', { provider: testProviderName });
            };

            expect(subscribe).toThrow(`Could not find provider named ${testProviderName}`);
        });

        test('throw a rejected promise when publish failed by any of the provider', () => {
            const pubsub = new PubSub();

            const awsIotProvider = new AWSIoTProvider({
                aws_pubsub_region: 'region',
                aws_pubsub_endpoint: 'wss://iot.mymockendpoint.org:443/notrealmqtt'
            });
            pubsub.addPluggable(awsIotProvider);

            const awsAppSyncProvider = new AWSAppSyncProvider();
            pubsub.addPluggable(awsAppSyncProvider);

            const mqttOverWSProvider = new MqttOverWSProvider({
                aws_pubsub_endpoint: 'wss://iot.eclipse.org:443/mqtt',
            });
            pubsub.addPluggable(mqttOverWSProvider);

            jest.spyOn(awsIotProvider, 'publish').mockImplementationOnce(() => {
                return Promise.reject('Failed to publish');
            });

            expect(pubsub.publish('topicA', 'my message AWSIoTProvider')).rejects.toThrowError('Failed to publish');
        });
    });

})

