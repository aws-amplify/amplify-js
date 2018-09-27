jest.mock('aws-sdk/clients/pinpoint', () => {
    const Pinpoint = () => {
        var pinpoint = null;
        return pinpoint;
    }

    Pinpoint.prototype.updateEndpoint = (params, callback) => {
        callback(null, 'data');
    }

    Pinpoint.prototype.putEvents = (params) => {
        return {
            on(event, callback) {
                callback();
            },
            send(callback) {
                callback(null, 'success');
            }
        }
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

jest.mock('uuid', () => {
    const mockfn = () => {return 'sessionId'};
    return { v1: mockfn };
})

import { AWS, JS, Credentials } from '@aws-amplify/core';
import AnalyticsProvider from "../../src/Providers/AWSPinpointProvider";
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Cache from '@aws-amplify/core';
import * as MobileAnalytics from 'aws-sdk/clients/mobileanalytics';
import * as Pinpoint from 'aws-sdk/clients/pinpoint';

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
    region: 'region',
    clientContext: {
        clientId: 'clientId',
        appTitle: 'appTitle',
        appVersionName: 'appVersionName',
        appVersionCode: 'appVersionCode',
        appPackageName: 'appPackageName',
        platform: 'platform',
        platformVersion: 'platformVersion',
        model: 'model',
        make: 'make',
        locale: 'locale'
    }
};

const optionsWithoutId = {
    appId: undefined,
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: 'region'
};

const optionsWithoutRegion = {
    appId: 'appId',
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: undefined
};

const timeSpyOn = jest.spyOn(Date.prototype, 'getTime').mockImplementation(() => {
    return 1526939075455;
});

const timeSpyOn2 = jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => {
    return 'isoString';
});
const timestamp = new Date().getTime();

beforeEach(() => {
    jest.useFakeTimers();
});

describe("AnalyticsProvider test", () => {
    describe('getCategory test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.getCategory()).toBe('Analytics');
        });
    });

    describe('getProviderName test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.getProviderName()).toBe('AWSPinpoint');
        });
    });

    describe('configure test', () => {
        test('happy case', () => {
            const analytics = new AnalyticsProvider();

            expect(analytics.configure({appId: 'appId'})).toEqual({"appId": "appId", "bufferSize": 1000, "flushInterval": 5000, "flushSize": 100, "resendLimit": 5});
        });
    });

    describe('record test', () => {
        test('record without credentials', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(options);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.reject('err');
            });
           
            expect(await analytics.record('params')).toBe(false);
            spyon.mockClear();
        });

        test('record without appId', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(optionsWithoutId);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
           
            expect(await analytics.record('params')).toBe(false);
            spyon.mockClear();
        });

        test('record without region', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(optionsWithoutRegion);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
           
            expect(await analytics.record('params')).toBe(false);
            spyon.mockClear();
        });

        test('record happy case', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure({
                appId: 'appId'
            });
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
     

            await analytics.record({
                event: {
                    name: 'customEvents'
                },
                config: {
                    endpointId: 'endpointId'
                }
            });

            spyon.mockClear();
        });

        test('start session happy case', async () => {
            const analytics = new AnalyticsProvider();
        
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
     

            await analytics.record({
                event: {
                    name: '_session_start'
                },
                config: {
                    endpointId: 'endpointId'
                }
            });

            spyon.mockClear();
        });

        test('stop session happy case', async () => {
            const analytics = new AnalyticsProvider();
        
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
     

            await analytics.record({
                event: {
                    name: '_session_stop'
                },
                config: {
                    endpointId: 'endpointId'
                }
            });

            spyon.mockClear();
        });

        test('updateEndpoint happy case', async () => {
            const analytics = new AnalyticsProvider();
        
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
     

            await analytics.record({
                event: {
                    name: '_update_endpoint'
                },
                config: {
                    endpointId: 'endpointId'
                }
            });

            spyon.mockClear();
        });
    });

    describe('startsession test', () => {
        test('happy case', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(
                options 
            );
            const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                return {
                    on(event, callback) {
                        return;
                    },
                    send(callback) {
                        callback(null, 'success');
                    }
                }
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

            const params = {event: { name: '_session_start', immediate: true}};
            await analytics.record(params);

            expect(spyon).toBeCalledWith({
                "ApplicationId": "appId",
                "EventsRequest": {
                    "BatchItem": {
                        "endpointId": {
                            "Endpoint": {
                                "Demographic": {
                                    "AppVersion": "appVersionName", 
                                    "Locale": "locale", 
                                    "Make": "make", 
                                    "Model": "model", 
                                    "Platform": "platform", 
                                    "PlatformVersion": 
                                    "platformVersion"
                                }
                            }, 
                            "Events": {
                                "sessionId": {
                                    "Attributes": undefined, 
                                    "EventType": "_session_start", 
                                    "Metrics": undefined, 
                                    "Session": {
                                        "Id": "sessionId", 
                                        "StartTimestamp": "isoString"
                                    }, 
                                    "Timestamp": "isoString"
                                }
                            }
                        }
                    }
                }
            });

            spyon.mockClear();
        });

        test('session start error', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(
                options 
            );
            const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                return {
                    on(event, callback) {
                        return;
                    },
                    send(callback) {
                        callback('err', null);
                    }
                }
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

        
           const params = {event: { name: '_session_start', immediate: true}};
        
            expect(await analytics.record(params)).toBe(false);
    
            spyon.mockClear();
        });
    });

    describe('stopSession test', () => {
        test('happy case', async () => {
           const analytics = new AnalyticsProvider();
            analytics.configure(
                options 
            );
            const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                return {
                    on(event, callback) {
                        return;
                    },
                    send(callback) {
                        callback(null, 'success');
                    }
                }
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

            const params = {event: { name: '_session_stop', immediate: true}};
            await analytics.record(params);

            expect(spyon).toBeCalledWith({
                "ApplicationId": "appId",
                "EventsRequest": {
                    "BatchItem": {
                        "endpointId": {
                            "Endpoint": {
                                "Demographic": {
                                    "AppVersion": "appVersionName", 
                                    "Locale": "locale", 
                                    "Make": "make", 
                                    "Model": "model", 
                                    "Platform": "platform", 
                                    "PlatformVersion": 
                                    "platformVersion"
                                }
                            }, 
                            "Events": {
                                "sessionId": {
                                    "Attributes": undefined, 
                                    "EventType": "_session_stop", 
                                    "Metrics": undefined, 
                                    "Session": {
                                        "Duration": 0, 
                                        "Id": "sessionId", 
                                        "StartTimestamp": "isoString", 
                                        "StopTimestamp": "isoString"
                                    },
                                    "Timestamp": "isoString"
                                }
                            }
                        }
                    }
                }
            });

            spyon.mockClear();
        });

        test('session stop error', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(
                options 
            );
            const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                return {
                    on(event, callback) {
                        return;
                    },
                    send(callback) {
                        callback('err', null);
                    }
                }
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

        
           const params = {event: { name: '_session_stop', immediate: true}};
        
           expect(await analytics.record(params)).toBe(false);
            spyon.mockClear();
        });
    });



    describe('record test', () => {
        test('custom events', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(
                options 
            );
            const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                return {
                    on(event, callback) {
                        return;
                    },
                    send(callback) {
                        callback(null, 'success');
                    }
                }
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

            const params = {event: { name: 'custom event', immediate: true}};
            await analytics.record(params);

            expect(spyon).toBeCalledWith({
                "ApplicationId": "appId",
                "EventsRequest": {
                    "BatchItem": {
                        "endpointId": {
                            "Endpoint": {
                                "Demographic": {
                                    "AppVersion": "appVersionName", 
                                    "Locale": "locale", 
                                    "Make": "make", 
                                    "Model": "model", 
                                    "Platform": "platform", 
                                    "PlatformVersion": 
                                    "platformVersion"
                                }
                            }, 
                            "Events": {
                                "sessionId": {
                                    "Attributes": undefined, 
                                    "EventType": "custom event", 
                                    "Metrics": undefined, 
                                    "Session": {
                                        "Id": "sessionId", 
                                        "StartTimestamp": "isoString"
                                    },
                                    "Timestamp": "isoString"
                                }
                            }
                        }
                    }
                }
            });

            spyon.mockClear();
        });

        test('custom event error', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(
                options 
            );
            const spyon = jest.spyOn(Pinpoint.prototype, 'putEvents').mockImplementationOnce((params) => {
                return {
                    on(event, callback) {
                        return;
                    },
                    send(callback) {
                        callback('err', null);
                    }
                }
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

        
           const params = {event: { name: 'custom event', immediate: true}};
        
           expect(await analytics.record(params)).toBe(false);
            spyon.mockClear();
        });
    });

    describe('updateEndpoint test', () => {
        test('happy case', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(options);
            const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                callback(null, 'data');
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

            const params = {event: { name: '_update_endpoint', immediate: true}};
            await analytics.record(params);
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test('error case', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(
                options 
            );
            const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                callback('err', null);
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

        
           const params = {event: { name: '_update_endpoint', immediate: true}};
        
           expect(await analytics.record(params)).toBe(false);
            spyon.mockClear();
        });
    });
});