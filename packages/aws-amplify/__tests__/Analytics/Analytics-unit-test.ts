jest.mock('aws-sdk-mobile-analytics', () => {
    const Manager = () => {}

    Manager.prototype.recordEvent = () => {

    }

    Manager.prototype.recordMonetizationEvent = () => {

    }

    Manager.prototype.startSession = () => {

    }

    Manager.prototype.stopSession = () => {

    }

    var ret =  {
        Manager: Manager
    }
    return ret;
});

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

/*
jest.mock('../../src/Auth', () => {
    return null;
});
*/
import * as AWS from 'aws-sdk/global';
import * as Pinpoint from 'aws-sdk/clients/pinpoint';
import * as AMA from 'aws-sdk-mobile-analytics';
import * as Manager from 'aws-sdk-mobile-analytics/lib/MobileAnalyticsSessionManager';
import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from '../../src/Analytics/types';
import { ClientDevice } from '../../src/Common';
import { default as Analytics } from "../../src/Analytics/Analytics";
import { ConsoleLogger as Logger } from '../../src/Common/Logger';
import Auth from '../../src/Auth/Auth';

const spyon = jest.spyOn(Auth.prototype, 'currentCredentials')
    .mockImplementationOnce(() => {
        return new Promise((res, rej) => {
            res('credentials');
        });
    });

describe("Analytics test", () => {
    describe('configure test', () => {
        test('happy case', () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const spyon = jest.spyOn(Analytics.prototype, "_initClients");

            const analytics = new Analytics(options);
            const config = analytics.configure({});
            
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });

        test('init pinpoint failed', () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            const analytics = new Analytics(options);
            try{
                const config = analytics.configure({});
            } catch (e) {
                expect(e).toBe('err');
            }
            spyon.mockClear();
        });

        test('no app Id', () => {
            const options: AnalyticsOptions = {
                appId: null,
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const analytics = new Analytics(options);

            const config = analytics.configure({});
        });

        test('if using aws_exports config', () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const analytics = new Analytics(options);
            const config = analytics.configure({
                aws_mobile_analytics_app_id: 'id from exports'
            });
            
            expect(config['appId']).toBe('id from exports');
        });

        test('no credentials provided', () => {
           const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: null
            };

            const analytics = new Analytics(options);

            const config = analytics.configure({});

        });

        test('get current credentials from auth', async () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const spyon = jest.spyOn(Auth.prototype, 'currentCredentials')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res('cred1');
                    });
                });

            const analytics = new Analytics(options);
            const config = await analytics.configure({});
            
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });
    });

    describe("constructor test", () => {
        test("happy case", () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const spyon = jest.spyOn(Analytics.prototype, "configure");

            const analytics = new Analytics(options);
            
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });
    });

    describe("startSession", () => {
        test("happy case", () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const analytics = new Analytics(options);

            analytics.startSession();
        });
    });

    describe("stopSession", () => {
        test("happy case", async () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const analytics = await new Analytics(options);

            await analytics.stopSession();
        });
    });

    describe("restart", () => {
        test("happy case", () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const analytics = new Analytics(options);

            analytics.restart();
        });
    });

    describe("record", () => {
        test("happy case", () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const analytics = new Analytics(options);

            analytics.record('myevent');
        });
    });

    describe("recordMonetization", () => {
        test("happy case", () => {
            const options: AnalyticsOptions = {
                appId: 'appId',
                platform: 'platform',
                clientId: 'clientId',
                region: 'region',
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityId: 'identityId',
                    Logins: {},
                    LoginId: 'loginId'
                })
            };

            const analytics = new Analytics(options);

          //  analytics.recordMonetization('myevent');
        });
    });
});