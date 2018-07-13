import PubSub from '../src/PubSub';
import { MqttOverWSProvider, AWSIoTProvider } from '../src/Providers';
// import Amplify from '../../src/';
import { Credentials } from '@aws-amplify/core';
import { Client } from 'paho-mqtt';
jest.mock('paho-mqtt');

global.Paho = global.Paho || { MQTT: { Client } };

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

    });

    describe('AWSIoTProvider', () => {
        test('subscribe and publish to the same topic using AWSIoTProvider', async (done) => {
            expect.assertions(2);
            const config = { 
                PubSub : {
                    aws_pubsub_region: 'region',
                    aws_pubsub_endpoint: 'wss://iot.eclipse.org:443/mqtt'
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
                next: data => {                    
                    expect(data).toEqual(expectedData);
                    done()},
                close: () => console.log('done'),
                error: error => console.log('error', error),
            });

            await pubsub.publish('topicA', 'my message');
        });
    });

    
})

