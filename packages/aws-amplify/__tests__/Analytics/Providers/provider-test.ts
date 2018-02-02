jest.mock('aws-sdk/clients/pinpoint', () => {
    const Pinpoint = () => {
        var pinpoint = null;
        return pinpoint;
    }

    Pinpoint.prototype.updateEndpoint = (params, callback) => {
        callback(null, 'data');
    }

    return Pinpoint;
});

jest.mock('aws-sdk/clients/mobileanalytics', () => {
    const MobileAnalytics = () => {
        var mobileanalytics = null;
        return mobileanalytics;
    }

    MobileAnalytics.prototype.putEvents = (params, callback) => {
        callback(null, 'data');
    }

    return MobileAnalytics;
});


jest.mock('../../../src/Common/Builder', () => {
    return {
        default: null
    };
});

import { Pinpoint, AWS, MobileAnalytics, JS } from '../../../src/Common';
import AnalyticsProvider from "../../../src/Analytics/Providers/AwsAnalyticsProvider";
import { ConsoleLogger as Logger } from '../../../src/Common/Logger';

const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
}

const clientInfo = {
    appVersion: '1.0',
    make: 'make',
    model: 'model',
    version: '1.0.0',
    platform: 'platform'
}

const options = {
    appId: 'appId',
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: 'region'
};

// // jest.spyOn(JS, 'generateRandomString').mockReturnValue('randomString');

describe("AnalyticsProvider test", () => {
    describe('getCategory test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.getCategory()).toBe('Analytics');
        });
    });

    describe('configure test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.configure({appId: 'appId'})).toEqual({appId: 'appId'});
        });
    });

    describe('init test', () => {
        test('happy case', async () => {
            const analytics = new AnalyticsProvider();

            expect(await analytics.init({
                appId: 'appId',
                clientInfo: clientInfo,
                credentials: credentials,
                region: 'region'
            })).toBe(true);
        });

        test('no appid', async () => {
            const analytics = new AnalyticsProvider();

            expect(await analytics.init({})).toBe(false);
        });

        test('pinpoint error', async () => {
            const analytics = new AnalyticsProvider();
            const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                callback('err', null);
            });

            expect(await analytics.init({
                appId: 'appId',
                clientInfo: clientInfo,
                credentials: credentials,
                region: 'region'
            })).toBe(false);

            spyon.mockClear();
        });
    });

    describe('putEvent test', () => {
        test('session start', async () => {
            const analytics = new AnalyticsProvider();
            await analytics.init(options);
            const spyon = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementation((params, callback) => {
                callback(null, 'data');
            });

            const params = {
                eventName: 'session_start'
            };

            await analytics.putEvent(params);
            expect(spyon).toBeCalled();
            expect(spyon.mock.calls[0][0].events[0].eventType).toBe('_session.start');

            spyon.mockClear();
        });

        test('session start error', async () => {
            const analytics = new AnalyticsProvider();
            await analytics.init(options);
            const spyon = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementation((params, callback) => {
                callback('err', null);
            });

            const params = {
                eventName: 'session_start'
            };

            try {
                await analytics.putEvent(params);
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('session stop', async () => {
            const analytics = new AnalyticsProvider();
            await analytics.init(options);
            const spyon = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementation((params, callback) => {
                callback(null, 'data');
            });

            const params = {
                eventName: 'session_stop'
            };

            await analytics.putEvent(params);
            expect(spyon).toBeCalled();
            expect(spyon.mock.calls[0][0].events[0].eventType).toBe('_session.stop');

            spyon.mockClear();
        });

        test('session stop error', async () => {
            const analytics = new AnalyticsProvider();
            await analytics.init(options);
            const spyon = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementation((params, callback) => {
                callback('err', null);
            });

            const params = {
                eventName: 'session_stop'
            };

            try {
                await analytics.putEvent(params);
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('custom events', async () => {
            const analytics = new AnalyticsProvider();
            await analytics.init(options);
            const spyon = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementation((params, callback) => {
                callback(null, 'data');
            });

            const params = {
                eventName: 'custom event'
            };

            await analytics.putEvent(params);
            expect(spyon).toBeCalled();
            expect(spyon.mock.calls[0][0].events[0].eventType).toBe('custom event');

            spyon.mockClear();
        });

        test('custom event error', async () => {
            const analytics = new AnalyticsProvider();
            await analytics.init(options);
            const spyon = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementation((params, callback) => {
                callback('err', null);
            });

            const params = {
                eventName: 'custom event'
            };

            try {
                await analytics.putEvent(params);
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });
    });
});
