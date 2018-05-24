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

import { Pinpoint, AWS, MobileAnalytics, JS } from '../../../src/Common';
import KinesisProvider from "../../../src/Analytics/Providers/AWSKinesisProvider";
import Auth from '../../../src/Auth';

const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
}

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

            expect(analytics.configure({region: 'region1'})).toEqual({region: 'region1'});
        });
    });

    describe('record test', () => {
        test('record without credentials', async () => {
            const analytics = new KinesisProvider();

            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
                return Promise.reject('err');
            });
        
            expect(await analytics.record('params')).toBe(false);
            spyon.mockClear();
        });
    });
});