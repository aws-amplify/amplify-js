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

import { Pinpoint, AWS, MobileAnalytics, ClientDevice } from '../../src/Common';
import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from '../../src/Analytics/types';
import { default as Analytics } from "../../src/Analytics/Analytics";
import { ConsoleLogger as Logger } from '../../src/Common/Logger';
import Auth from '../../src/Auth/Auth';

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

jest.spyOn(Analytics.prototype, 'generateRandomString').mockReturnValue('randomString');

describe("Analytics test", () => {
    describe("constructor test", () => {
        test("happy case", () => {
            const spyon = jest.spyOn(Analytics.prototype, "configure");

            const analytics = new Analytics(options);
            
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test("with no config", () => {
            const spyon = jest.spyOn(Analytics.prototype, "configure");

            const analytics = new Analytics(null);
            
            expect(spyon).not.toBeCalled();

            spyon.mockClear();
        });

        test('with client_info platform', () => {
            const spyon = jest.spyOn(Analytics.prototype, "configure");
            const spyon2 = jest.spyOn(ClientDevice, 'clientInfo').mockImplementationOnce(() => {
                return {
                    platform: 'platform'
                };
            });

            const analytics = new Analytics(options);
            
            expect(spyon).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

    describe('configure test', () => {
        test('happy case with aws_exports', () => {
            const analytics = new Analytics(options);

            const config = Object.assign({}, {
                aws_mobile_analytics_app_id: '123456',
                aws_project_region: 'region'
            }, options);

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            const curConfig = analytics.configure(config);

            expect(spyon).toBeCalled();
            expect(curConfig['appId']).toBe('123456');

            spyon.mockClear();
        });

        test('no app id', () => {
            const optionsWithNoAppId = {
                appId: null,
                platform: 'platform',
                clientId: 'clientId',
                region: 'region'
            }
            const analytics = new Analytics(optionsWithNoAppId);

            const config = {
                aws_mobile_analytics_app_id: null,
                aws_project_region: 'region'
            };

            const curConfig = analytics.configure(config);
        });
    });

    
    describe("startSession", () => {
        test("happy case", async () => {
            const analytics = new Analytics(options);
            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics._initClients();
           
            const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents');
            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics.startSession();

            expect(spyon2).toBeCalled();
            expect(spyon2.mock.calls[0][0].events[0].eventType).toBe('_session.start');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test("put events error", async () => {
            const analytics = new Analytics(options);

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics._initClients();
           
            const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementationOnce((params, callback) => {
                callback('err', null);
            });

            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });


            try {

                await analytics.startSession();
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });
    });

    describe("stopSession", () => {
        test("happy case", async () => {
            const analytics = new Analytics(options);

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics._initClients();
           
            const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents');
            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });
            await analytics.stopSession();

            expect(spyon2).toBeCalled();
            expect(spyon2.mock.calls[0][0].events[0].eventType).toBe('_session.stop');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test("put events error", async () => {     
            const analytics = new Analytics(options);

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics._initClients();
           
            const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementationOnce((params, callback) => {
                callback('err', null);
            });
            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });
            try {
                await analytics.stopSession();
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });
    });

    describe("restart", () => {
        test("happy case", async () => {
            const analytics = new Analytics(options);
            const spyon = jest.spyOn(Analytics.prototype, 'stopSession').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('data');
                });
            });

            await analytics.restart();

            //expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test("put events error", async () => {
            const spyon = jest.spyOn(Analytics.prototype, 'stopSession').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });

            const analytics = new Analytics(options);
            try {
                await analytics.restart();
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        
    });

    describe("record", () => {
        test("happy case", async () => {     
            const analytics = new Analytics(options);

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics._initClients();
           
            const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents');
            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics.record('event');

            expect(spyon2).toBeCalled();
            expect(spyon2.mock.calls[0][0].events[0].eventType).toBe('event');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test("put events error", async () => {      
            const analytics = new Analytics(options);

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });

            await analytics._initClients();
           
            const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementationOnce((params, callback) => {
                callback('err', null);
            });
            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(credentials)
                });
            });
            try {
                await analytics.record('event');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });
    });
});