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

import { AWS, JS, Credentials, ClientDevice } from '@aws-amplify/core';
import AnalyticsProvider from "../../src/Providers/AWSPinpointProvider";
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Cache from '@aws-amplify/core';
import * as MobileAnalytics from 'aws-sdk/clients/mobileanalytics';
import * as Pinpoint from 'aws-sdk/clients/pinpoint';

const endpointConfigure = {
    Address: 'configured', // The unique identifier for the recipient. For example, an address could be a device token, email address, or mobile phone number.
    Attributes: {
        // Custom attributes that your app reports to Amazon Pinpoint. You can use these attributes as selection criteria when you create a segment.
        hobbies: ['configured'],
    },
    ChannelType: 'configured', // The channel type. Valid values: APNS, GCM
    Demographic: {
        AppVersion: 'configured', // The version of the application associated with the endpoint.
        Locale: 'configured', // The endpoint locale in the following format: The ISO 639-1 alpha-2 code, followed by an underscore, followed by an ISO 3166-1 alpha-2 value
        Make: 'configured', // The manufacturer of the endpoint device, such as Apple or Samsung.
        Model: 'configured', // The model name or number of the endpoint device, such as iPhone.
        ModelVersion: 'configured', // The model version of the endpoint device.
        Platform: 'configured', // The platform of the endpoint device, such as iOS or Android.
        PlatformVersion: 'configured', // The platform version of the endpoint device.
        Timezone: 'configured' // The timezone of the endpoint. Specified as a tz database value, such as Americas/Los_Angeles.
    },
    Location: {
        City: 'configured', // The city where the endpoint is located.
        Country: 'configured', // The two-letter code for the country or region of the endpoint. Specified as an ISO 3166-1 alpha-2 code, such as "US" for the United States.
        Latitude: 0, // The latitude of the endpoint location, rounded to one decimal place.
        Longitude: 0, // The longitude of the endpoint location, rounded to one decimal place.
        PostalCode: 'configured', // The postal code or zip code of the endpoint.
        Region: 'configured' // The region of the endpoint location. For example, in the United States, this corresponds to a state.
    },
    Metrics: {
        // Custom metrics that your app reports to Amazon Pinpoint.
    },
    /** Indicates whether a user has opted out of receiving messages with one of the following values:
        * ALL - User has opted out of all messages.
        * NONE - Users has not opted out and receives all messages.
        */
    OptOut: 'configured',
    // Customized userId
    UserId: 'configured',
    // User attributes
    UserAttributes: {
        interests: ['configured']
        // ...
    }
};

const defaultEndpointConfigure = {
    Address: 'default', // The unique identifier for the recipient. For example, an address could be a device token, email address, or mobile phone number.
    Attributes: {
        // Custom attributes that your app reports to Amazon Pinpoint. You can use these attributes as selection criteria when you create a segment.
        hobbies: ['default'],
    },
    ChannelType: 'default', // The channel type. Valid values: APNS, GCM
    Demographic: {
        AppVersion: 'default', // The version of the application associated with the endpoint.
        Locale: 'default', // The endpoint locale in the following format: The ISO 639-1 alpha-2 code, followed by an underscore, followed by an ISO 3166-1 alpha-2 value
        Make: 'default', // The manufacturer of the endpoint device, such as Apple or Samsung.
        Model: 'default', // The model name or number of the endpoint device, such as iPhone.
        ModelVersion: 'default', // The model version of the endpoint device.
        Platform: 'default', // The platform of the endpoint device, such as iOS or Android.
        PlatformVersion: 'default', // The platform version of the endpoint device.
        Timezone: 'default' // The timezone of the endpoint. Specified as a tz database value, such as Americas/Los_Angeles.
    },
    Location: {
        City: 'default', // The city where the endpoint is located.
        Country: 'default', // The two-letter code for the country or region of the endpoint. Specified as an ISO 3166-1 alpha-2 code, such as "US" for the United States.
        Latitude: 0, // The latitude of the endpoint location, rounded to one decimal place.
        Longitude: 0, // The longitude of the endpoint location, rounded to one decimal place.
        PostalCode: 'default', // The postal code or zip code of the endpoint.
        Region: 'default' // The region of the endpoint location. For example, in the United States, this corresponds to a state.
    },
    Metrics: {
        // Custom metrics that your app reports to Amazon Pinpoint.
    },
    /** Indicates whether a user has opted out of receiving messages with one of the following values:
        * ALL - User has opted out of all messages.
        * NONE - Users has not opted out and receives all messages.
        */
    OptOut: 'default',
    // Customized userId
    UserId: 'default',
    // User attributes
    UserAttributes: {
        interests: ['default']
        // ...
    }
};


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
}

const optionsWithDefaultEndpointConfigure = {
    appId: 'appId',
    clientInfo: clientInfo,
    credentials: credentials,
    endpointId: 'endpointId',
    region: 'region',
    endpoint: defaultEndpointConfigure
}

const optionsWithClientContext = {
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

jest.spyOn(ClientDevice, 'clientInfo').mockImplementation(() => {
    return {
        appVersion: 'clientInfoAppVersion',
        make: 'clientInfoMake',
        model: 'clientInfoModel',
        version: 'clientInfoVersion',
        platform: 'clientInfoPlatform'
    }
});
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
        test('happy case with default client info', async () => {
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
            expect(spyon.mock.calls[0][0]).toEqual({
                "ApplicationId": "appId", 
                "EndpointId": "endpointId", 
                "EndpointRequest": {
                    "Attributes": {}, 
                    "ChannelType": undefined, 
                    "Demographic": {
                        "AppVersion": "clientInfoAppVersion", 
                        "Make": "clientInfoMake", 
                        "Model": "clientInfoModel", 
                        "ModelVersion": "clientInfoVersion", 
                        "Platform": "clientInfoPlatform"
                    }, 
                    "EffectiveDate": "isoString", 
                    "Location": {}, 
                    "Metrics": {}, 
                    "RequestId": "sessionId", 
                    "User": {
                        "UserAttributes": {}, 
                        "UserId": "identityId"
                    }
                }
            });

            spyon.mockClear();
        });

        test('happy case with client context provided', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(optionsWithClientContext);
            const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                callback(null, 'data');
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });

            const params = {event: { name: '_update_endpoint', immediate: true}};
            await analytics.record(params);
            expect(spyon.mock.calls[0][0]).toEqual({
                "ApplicationId": "appId", 
                "EndpointId": "endpointId", 
                "EndpointRequest": {
                    "Attributes": {}, 
                    "ChannelType": undefined, 
                    "Demographic": {
                        "AppVersion": "clientInfoAppVersion", 
                        "Locale": undefined,
                        "Make": "make",
                        "Model": "model",
                        "ModelVersion": "clientInfoVersion", 
                        "Platform": "platform",
                        "PlatformVersion": "platformVersion",
                    }, 
                    "EffectiveDate": "isoString", 
                    "Location": {}, 
                    "Metrics": {}, 
                    "RequestId": "sessionId", 
                    "User": {
                        "UserAttributes": {}, 
                        "UserId": "identityId"
                    }
                }
            });

            spyon.mockClear();
        });
        
        test('happy case with default enpoint configure provided', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(optionsWithDefaultEndpointConfigure);
            const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                callback(null, 'data');
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            const {UserId, UserAttributes, ...endpointRequestContext} = defaultEndpointConfigure;

            const params = {event: { name: '_update_endpoint', immediate: true}};
            await analytics.record(params);
            
            expect(spyon.mock.calls[0][0]).toEqual({
                "ApplicationId": "appId", 
                "EndpointId": "endpointId", 
                "EndpointRequest": {
                    "EffectiveDate": "isoString", 
                    "RequestId": "sessionId", 
                    "User": {
                        "UserAttributes": {
                            "interests": [ 'default' ]
                        }, 
                        "UserId": "default"
                    },
                    ...endpointRequestContext
                }
            });

            spyon.mockClear();
        });

        test('happy case with specified enpoint configure provided', async () => {
            const analytics = new AnalyticsProvider();
            analytics.configure(optionsWithDefaultEndpointConfigure);
            const spyon = jest.spyOn(Pinpoint.prototype, 'updateEndpoint').mockImplementationOnce((params, callback) => {
                callback(null, 'data');
            });

            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            const {UserId, UserAttributes, ...endpointRequestContext} = endpointConfigure;

            const params = {event: { name: '_update_endpoint', immediate: true, ...endpointConfigure}};
            await analytics.record(params);
            
            expect(spyon.mock.calls[0][0]).toEqual({
                "ApplicationId": "appId", 
                "EndpointId": "endpointId", 
                "EndpointRequest": {
                    "EffectiveDate": "isoString", 
                    "RequestId": "sessionId", 
                    "User": {
                        "UserAttributes": {
                            "interests": [ 'configured' ]
                        }, 
                        "UserId": "configured"
                    },
                    ...endpointRequestContext
                }
            });

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