jest.mock('aws-sdk/clients/kinesis', () => {
    const Kinesis = () => {
        var kinesis = null;
        return kinesis;
    }

    Kinesis.prototype.putRecords = (params, callback) => {
        callback(null, 'data');
    }

    return Kinesis;
});

import { Pinpoint, AWS, MobileAnalytics, JS, Credentials } from '@aws-amplify/core';
import KinesisProvider from "../../src/Providers/AWSKinesisProvider";

const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
}

jest.useFakeTimers()

describe('kinesis provider test', () => {
    describe('getCategory test', () => {
        test('happy case', () => {
            const analytics = new KinesisProvider();

            expect(analytics.getCategory()).toBe('Analytics');
        });
    });

    describe('getProviderName test', () => {
        test('happy case', () => {
            const analytics = new KinesisProvider();

            expect(analytics.getProviderName()).toBe('AWSKinesis');
        });
    });

    describe('configure test', () => {
        test('happy case', () => {
            const analytics = new KinesisProvider();

            expect(analytics.configure({region: 'region1'})).toEqual({"bufferSize": 1000, "flushInterval": 5000, "flushSize": 100, "region": "region1", "resendLimit": 5});
        });
    });

    describe('record test', () => {
        test('record without credentials', async () => {
            const analytics = new KinesisProvider();

            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.reject('err');
            });
        
            expect(await analytics.record('params')).toBe(false);
            spyon.mockClear();
        });

        test('record happy case', async () => {
            const analytics = new KinesisProvider();
        
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
     

            await analytics.record({
                event: {
                    data: {
                        data: 'data'
                    },
                    streamName: 'stream'
                },
                config: {}
            });

            jest.advanceTimersByTime(6000);

            spyon.mockClear();
        });

    });
});