jest.mock('../../src/Common/Builder', () => {
    return {
        default: null
    };
});

import { AWS, ClientDevice, Parser } from '../../src/Common';
import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from '../../src/Analytics/types';
import { default as Analytics } from "../../src/Analytics/Analytics";
import { ConsoleLogger as Logger } from '../../src/Common/Logger';
import Auth from '../../src/Auth/Auth';
import AWSAnalyticsProvider from '../../src/Analytics/Providers/AWSAnalyticsProvider';

const options: AnalyticsOptions = {
    appId: 'appId',
    platform: 'platform',
    clientId: 'clientId',
    region: 'region'
};

const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
}

describe("Analytics test", () => {
    describe('configure test', () => {
        test('happy case with default parser', () => {
            const analytics = new Analytics();
            const spyon = jest.spyOn(ClientDevice, 'clientInfo').mockImplementationOnce(() => {
                return 'clientInfo';
            });
            const spyon2 = jest.spyOn(Parser, 'parseMobilehubConfig').mockImplementationOnce(() => {
                return {
                    Analytics: {appId: 'appId'}
                }
            });

            expect(analytics.configure({attr: 'attr'})).toEqual({appId: 'appId', clientInfo: 'clientInfo'});

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

    describe('init test', () => {
        test('happy case with default provider', async () => {
            const analytics = new Analytics();

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials);
                });
            });

            const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'init').mockImplementationOnce(() => {
                return true;
            });

            expect(await analytics.init()).toBe(true);
            expect(spyon2).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('can not get credentials', async () => {
            const analytics = new Analytics();
            
            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });

            expect(await analytics.init()).toBe(false);

            spyon.mockClear();
        });

        test('if provider provided', async () => {
            const provider = {
                init: jest.fn()
            }
            
            const analytics = new Analytics();

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials);
                });
            });

            analytics.setProvider(provider);
            await analytics.init();
            expect(provider.init).toBeCalled();

            spyon.mockClear();
        });
    });

    describe('startSession test', () => {
        test('happy case', async () => {
            const provider = {
                putEvent: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.setProvider(provider);

            await analytics.startSession();

            expect(provider.putEvent).toBeCalledWith({eventName: 'session_start'});
        });
    });

    describe('stopSession test', () => {
        test('happy case', async () => {
            const provider = {
                putEvent: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.setProvider(provider);

            await analytics.stopSession();

            expect(provider.putEvent).toBeCalledWith({eventName: 'session_stop'});
        });
    });

    describe('record test', () => {
        test('happy case', async () => {
            const provider = {
                putEvent: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.setProvider(provider);

            await analytics.record('eventName');

            expect(provider.putEvent).toBeCalledWith({eventName: 'eventName'});
        });
    });

    describe('restart test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(Analytics.prototype, 'init');

            const analytics = new Analytics();
            await analytics.restart();

            expect(spyon).toBeCalled();
            
            spyon.mockClear();
        });
    })
});
