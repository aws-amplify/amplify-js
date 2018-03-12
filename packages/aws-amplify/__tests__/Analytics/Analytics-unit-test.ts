jest.mock('../../src/Common/Builder', () => {
    return {
        default: null
    };
});

jest.mock('../../src/Credentials', () => {
    const Credentials = {
        getCredentials(params) {
            return new Promise((res, rej) => {
                res({
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                });
            });
        },
        setCredentials(params) {
            return null;
        },
        removeCredentials(params) {
            return null;
        },
        essentialCredentials(params) {
            return 'cred';
        }
    };

    return {
        default: Credentials        
    }
});

import { AWS, ClientDevice, Parser } from '../../src/Common';
import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from '../../src/Analytics/types';
import { default as Analytics } from "../../src/Analytics/Analytics";
import { ConsoleLogger as Logger } from '../../src/Common/Logger';
import Auth from '../../src/Auth/Auth';
import AWSAnalyticsProvider from '../../src/Analytics/Providers/AWSAnalyticsProvider';
import Credentials from '../../src/Credentials';

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

jest.useFakeTimers();

describe('setInterval test', () => {
    test('record failed', async () => {
        const analytics = new Analytics();

        const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'record').mockImplementationOnce(() => {
            return Promise.resolve(false);
        });

        await analytics.startSession();

        jest.advanceTimersByTime(6000);

        spyon2.mockClear();
    });

    test('record success', async () => {
        const analytics = new Analytics();

        analytics.configure({
            Analytics: {
                appId: 'appId'
            }
        });

        const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'record').mockImplementationOnce(() => {
            return Promise.resolve(true);
        });

        await analytics.startSession();

        jest.advanceTimersByTime(6000);

        // expect(spyon2).toBeCalled();
        spyon2.mockClear();
    });
});

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
            const spyon3 = jest.spyOn(AWSAnalyticsProvider.prototype, 'configure').mockImplementationOnce(() => { return; });

            expect(analytics.configure({attr: 'attr'})).toEqual({appId: 'appId', clientInfo: 'clientInfo'});

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });
    });

    describe('startSession test', () => {
        test('happy case', async () => {
            const provider = {
                configure: jest.fn(),
                startSession: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);


            // const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'startSession').mockImplementationOnce(() => { return; });

            await analytics.startSession();

            // expect(provider.startSession).toBeCalled();
        });

        test('get credentials error', async () => {
            const provider = {
                configure: jest.fn(),
                startSession: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);

            const spyon = jest.spyOn(Credentials, 'getCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                })
            });

            // const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'startSession').mockImplementationOnce(() => { return; });

            expect(await analytics.startSession()).toBe(false);

            spyon.mockClear();
            // spyon2.mockClear();
        });
    });

    describe('stopSession test', () => {
        test('happy case', async () => {
            const provider = {
                configure: jest.fn(),
                stopSession: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);

            // const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'stopSession').mockImplementationOnce(() => { return; });

            await analytics.stopSession();
        });

        test('get credentials error', async () => {
            const provider = {
                configure: jest.fn(),
                stopSession: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);

            const spyon = jest.spyOn(Credentials, 'getCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                })
            });

            // const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'stopSession').mockImplementationOnce(() => { return; });

            expect(await analytics.stopSession()).toBe(false);

            spyon.mockClear();
            // spyon2.mockClear();
        });
    });

    describe('record test', () => {
        test('happy case', async () => {
            const provider = {
                configure: jest.fn(),
                record: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);
            // const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'record').mockImplementationOnce(() => { return; });

            await analytics.record('myevent')
        });

        test('get credentials error', async () => {
            const provider = {
                configure: jest.fn(),
                record: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);

            const spyon = jest.spyOn(Credentials, 'getCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                })
            });

            // const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'record').mockImplementationOnce(() => { return; });

            expect(await analytics.record('myevent')).toBe(false);

            spyon.mockClear();
            // spyon2.mockClear();
        });
    });

        describe('updateEndpoint test', () => {
        test('happy case', async () => {
            const provider = {
                configure: jest.fn(),
                record: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);

            await analytics.updateEndpoint({Analytics: {Address: 'Address'}});
        });

        test('get credentials error', async () => {
            const provider = {
                configure: jest.fn(),
                record: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
            
            const analytics = new Analytics();

            analytics.addPluggable(provider);

            const spyon = jest.spyOn(Credentials, 'getCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                })
            });

            // const spyon2 = jest.spyOn(AWSAnalyticsProvider.prototype, 'record').mockImplementationOnce(() => { return; });

            await analytics.updateEndpoint({Analytics: {Address: 'Address'}});

            spyon.mockClear();
        });
    });

    describe('addPluggable test', () => {
        test('happy case', async () => {
            const provider = {
                configure: jest.fn(),
                record: jest.fn(),
                getCategory: jest.fn(),
                getProviderName: jest.fn()
            }
        
            const analytics = new Analytics();

            await analytics.addPluggable(provider);
        });
    });
});
