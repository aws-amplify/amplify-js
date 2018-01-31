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



import { Pinpoint, AWS, MobileAnalytics, JS } from '../../../src/Common';
import Analytics from "../../../src/Analytics/Providers/AwsAnalyticsProvider";
import { ConsoleLogger as Logger } from '../../../src/Common/Logger';

// const options = {
//     appId: 'appId',
//     platform: 'platform',
//     clientId: 'clientId',
//     region: 'region'
// };

// const credentials = {
//     accessKeyId: 'accessKeyId',
//     sessionToken: 'sessionToken',
//     secretAccessKey: 'secretAccessKey',
//     identityId: 'identityId',
//     authenticated: true
// }

// jest.spyOn(JS, 'generateRandomString').mockReturnValue('randomString');

test('', () => {
    const a = 3;
    expect(a).toBe(3);
});
describe("Analytics test", () => {
    describe('getCategory test', () => {
        test.only('happy case', () => {
            const analytics = new Analytics();

            expect(analytics.getCategory()).toBe('Analytics');
        });
    });
});

//     describe('configure test', () => {
//         test('happy case', () => {
//             const analytics = new Analytics();

//             expect(analytics.configure({appId: 'appId'})).toEqual({appId: 'appId'});
//         });
//     });
    
//     describe('init test', () => {
//         test('happy case', async () => {
//             const analytics = new Analytics();
//             const spyon = jest.spyOn(analytics, 'configure').mockImplementationOnce(() => {return;});

//             expect(await analytics.init({appId: 'appId'})).toBe(true);

            
//         });
//     });
    
//     describe("startSession", () => {
//         test("happy case", async () => {
//             const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     res(credentials)
//                 });
//             });

//             const analytics = new Analytics(options);
//             await analytics._initClients();
           
//             const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents');
//             spyon2.mockClear();
//             await analytics.startSession();

//             expect(spyon2).toBeCalled();
//             expect(spyon2.mock.calls[0][0].events[0].eventType).toBe('_session.start');

//             spyon.mockClear();
//             spyon2.mockClear();
//         });

//         test("put events error", async () => {
//             const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     res(credentials)
//                 });
//             });

//             const analytics = new Analytics(options);
//             await analytics._initClients();
           
//             const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementationOnce((params, callback) => {
//                 callback('err', null);
//             });

//             spyon2.mockClear();
//             try {
//                 await analytics.startSession();
//             } catch (e) {
//                 expect(e).toBe('err');
//             }

//             spyon.mockClear();
//             spyon2.mockClear();
//         });
//     });

//     describe("stopSession", () => {
//         test("happy case", async () => {
//             const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     res(credentials)
//                 });
//             });

//             const analytics = new Analytics(options);
//             await analytics._initClients();
           
//             const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents');
            
//             spyon2.mockClear();
//             await analytics.stopSession();

//             expect(spyon2).toBeCalled();
//             expect(spyon2.mock.calls[0][0].events[0].eventType).toBe('_session.stop');

//             spyon.mockClear();
//             spyon2.mockClear();
//         });

//         test("put events error", async () => {
//             const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     res(credentials)
//                 });
//             });

//             const analytics = new Analytics(options);
//             await analytics._initClients();
           
//             const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementationOnce((params, callback) => {
//                 callback('err', null);
//             });

//             spyon2.mockClear();
//             try {
//                 await analytics.stopSession();
//             } catch (e) {
//                 expect(e).toBe('err');
//             }

//             spyon.mockClear();
//             spyon2.mockClear();
//         });
//     });

//     describe("restart", () => {
//         test("happy case", async () => {
//             const analytics = new Analytics(options);
//             const spyon = jest.spyOn(Analytics.prototype, 'stopSession').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     res('data');
//                 });
//             });

//             await analytics.restart();

//             expect(spyon).toBeCalled();

//             spyon.mockClear();
//         });

//         test("put events error", async () => {
//             const spyon = jest.spyOn(Analytics.prototype, 'stopSession').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     rej('err');
//                 });
//             });

//             const analytics = new Analytics(options);
//             try {
//                 await analytics.restart();
//             } catch (e) {
//                 expect(e).toBe('err');
//             }

//             spyon.mockClear();
//         });

        
//     });

//     describe("record", () => {
//         test("happy case", async () => {
//             const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     res(credentials)
//                 });
//             });

//             const analytics = new Analytics(options);
//             await analytics._initClients();
           
//             const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents');
//             spyon2.mockClear();

//             await analytics.record('event');

//             expect(spyon2).toBeCalled();
//             expect(spyon2.mock.calls[0][0].events[0].eventType).toBe('event');

//             spyon.mockClear();
//             spyon2.mockClear();
//         });

//         test("put events error", async () => {
//             const spyon = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
//                 return new Promise((res, rej) => {
//                     res(credentials)
//                 });
//             });

//             const analytics = new Analytics(options);
//             await analytics._initClients();
           
//             const spyon2 = jest.spyOn(MobileAnalytics.prototype, 'putEvents').mockImplementationOnce((params, callback) => {
//                 callback('err', null);
//             });

//             spyon2.mockClear();
//             try {
//                 await analytics.record('event');
//             } catch (e) {
//                 expect(e).toBe('err');
//             }

//             spyon.mockClear();
//             spyon2.mockClear();
//         });
//     });
 //});