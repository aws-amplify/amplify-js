jest.mock('aws-sdk/clients/personalizeevents', () => {
    const PersonalizeEvents = () => {
        var personalizeEvents = null;
        return personalizeEvents;
    }

    PersonalizeEvents.prototype.putEvents = (params, callback) => {
        callback(null, 'data');
    }

    return PersonalizeEvents;
});

import { MobileAnalytics, Credentials } from '@aws-amplify/core';
import AmazonPersonalizeProvider from "../../src/Providers/AmazonPersonalizeProvider";

jest.useFakeTimers();

const clientInfo = {
    appVersion: '1.0',
    make: 'make',
    model: 'model',
    version: '1.0.0',
    platform: 'platform'
}

const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
}

const TRACKING_ID = "trackingId";

jest.useFakeTimers()

describe('Personalize provider test', () => {
    describe('getProviderName test', () => {
        test('happy case', () => {
            const analytics = new AmazonPersonalizeProvider(TRACKING_ID);

            expect(analytics.getProviderName()).toBe('AmazonPersonalize');
        });
    });

    describe('configure test', () => {
        test('happy case', () => {
            const analytics = new AmazonPersonalizeProvider(TRACKING_ID);

            expect(analytics.configure({region: 'region1'})).toEqual(
                {"flushInterval": 5000, "flushSize": 5, "region": "region1"});
        });
    });

    describe('record test', () => {
        test('record without credentials', async () => {
            const analytics = new AmazonPersonalizeProvider(TRACKING_ID);

            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect(await analytics.record('params')).toBe(false);
            spyon.mockClear();
        });

        test('record happy case with identify event', async () => {
            const analytics = new AmazonPersonalizeProvider(TRACKING_ID);

            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });


            await analytics.record({
                event: {
                    eventName: "Identify",
                    properties: {"userId": "user1"},
                },
                config: {}
            });

            jest.advanceTimersByTime(6000);

            spyon.mockClear();
        });

        test('record happy case with Click event', async () => {
            const analytics = new AmazonPersonalizeProvider(TRACKING_ID);

            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });


            await analytics.record({
                event: {
                    eventName: "Click",
                    properties: {"id": "item1", "name": "itemA"},
                },
                config: {}
            });

            jest.advanceTimersByTime(6000);

            spyon.mockClear();
        });

    });
};
