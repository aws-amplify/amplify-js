import axios from 'axios';
import { CognitoIdentityCredentials } from 'aws-sdk';

import API, { graphqlOperation } from '../src/API';
import { RestClient } from '../src/RestClient';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import { Signer, ConsoleLogger as Logger, Credentials, Amplify } from '@aws-amplify/core';
import { anonOperationNotAloneMessage } from 'graphql/validation/rules/LoneAnonymousOperation';
import Cache from '@aws-amplify/cache';

jest.mock('axios');

const config = {
    API: {
        region: 'region',
        header: {},

    }
};

const Auth = {

}

describe('API test', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const aws_cloud_logic_custom = [{
        "id": "lh3s27sl16",
        "name": "todosCRUD",
        "description": "",
        "endpoint": "https://lh3s27sl16.execute-api.us-east-1.amazonaws.com/Development",
        "region": "us-east-1",
        "paths": ["/todos", "/todos/123"]
    }];

    describe('graphql test', () => {
        test('happy-case-query', async () => {
            const spyonAuth = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            const spyon = jest.spyOn(RestClient.prototype, 'post')
                .mockImplementationOnce((url, init) => {
                    return new Promise((res, rej) => {
                        res({})
                    });
                });

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                apiKey = 'secret_api_key',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: 'API_KEY',
                aws_appsync_apiKey: apiKey
            })
            const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
                getEvent(id: $id) {
                    id
                    name
                    where
                    when
                    description
                    comments(nextToken: $nextToken) {
                      items {
                        commentId
                        content
                        createdAt
                      }
                    }
                  }
                }`;

            const doc = parse(GetEvent);
            const query = print(doc);

            const headers = {
                Authorization: null,
                'X-Api-Key': apiKey
            };

            const body = {
                query,
                variables,
            };

            const init = {
                headers,
                body,
                signerServiceInfo: {
                    service: 'appsync',
                    region,
                }
            };

            await api.graphql(graphqlOperation(GetEvent, variables));

            expect(spyon).toBeCalledWith(url, init);
        });

        test('happy-case-query-oidc', async () => {
            const spyonAuth = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            const cognitoCredentialSpyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'get').mockImplementation((callback) => {
                callback(null);
            })

            const cache_config = {
                capacityInBytes : 3000,
                itemMaxSize : 800,
                defaultTTL : 3000000,
                defaultPriority : 5,
                warningThreshold : 0.8,
                storage: window.localStorage
            };
            
            Cache.configure(cache_config);

            const spyonCache = jest.spyOn(Cache, 'getItem').mockImplementationOnce(() => {
                return {
                    token: 'id_token'
                }
            });

            const spyon = jest.spyOn(RestClient.prototype, 'post')
                .mockImplementationOnce((url, init) => {
                    return new Promise((res, rej) => {
                        res({})
                    });
                });
            
            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: 'OPENID_CONNECT',
            })
            const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
                getEvent(id: $id) {
                    id
                    name
                    where
                    when
                    description
                    comments(nextToken: $nextToken) {
                      items {
                        commentId
                        content
                        createdAt
                      }
                    }
                  }
                }`;

            const doc = parse(GetEvent);
            const query = print(doc);

            const headers = {
                Authorization: 'id_token'
            };

            const body = {
                query,
                variables,
            };

            const init = {
                headers,
                body,
                signerServiceInfo: {
                    service: 'appsync',
                    region,
                }
            };

            await api.graphql(graphqlOperation(GetEvent, variables));

            expect(spyon).toBeCalledWith(url, init);

            spyonCache.mockClear();
        });

        test.skip('happy-case-subscription', (done) => {
            const spyonAuth = jest.spyOn(Credentials, 'get').mockImplementation(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            
            // TODO: This mock doesnt work on jest
            const spyon = jest.spyOn(RestClient.prototype, 'post')
                .mockImplementation((url, init) => {
                    return new Promise((res, rej) => {
                        res({})
                    });
                });

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                apiKey = 'secret_api_key',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: 'API_KEY',
                aws_appsync_apiKey: apiKey
            });
            const pubsub = new PubSub(config);

            const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
                subscribeToEventComments(eventId: $eventId) {
                  eventId
                  commentId
                  content
                }
              }`;

            const doc = parse(SubscribeToEventComments);
            const query = print(doc);

            const headers = {
                Authorization: null,
                'X-Api-Key': apiKey
            };

            const body = {
                query,
                variables,
            };

            const init = {
                headers,
                body,
                signerServiceInfo: {
                    service: 'appsync',
                    region,
                }
            };

            const observable = api.graphql(graphqlOperation(SubscribeToEventComments, variables)).subscribe({
                next: () => {
                    done();
                }
            });

            pubsub.publish('topic1', 'my message');

            expect(observable).not.toBe(undefined);
            expect(spyon).toBeCalled();
        });

        test('happy case mutation', async () => {
            const spyonAuth = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            const spyon = jest.spyOn(RestClient.prototype, 'post').mockImplementationOnce((url, init) => {
                return new Promise((res, rej) => {
                    res({})
                });
            });
            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                apiKey = 'secret_api_key',
                variables = {
                    id: '809392da-ec91-4ef0-b219-5238a8f942b2',
                    content: 'lalala',
                    createdAt: new Date().toISOString()
                };
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: 'API_KEY',
                aws_appsync_apiKey: apiKey
            })
            const AddComment = `mutation AddComment($eventId: ID!, $content: String!, $createdAt: String!) {
                commentOnEvent(eventId: $eventId, content: $content, createdAt: $createdAt) {
                  eventId
                  content
                  createdAt
                }
              }`;

            const doc = parse(AddComment);
            const query = print(doc);

            const headers = {
                Authorization: null,
                'X-Api-Key': apiKey
            };

            const body = {
                query,
                variables,
            };

            const init = {
                headers,
                body,
                signerServiceInfo: {
                    service: 'appsync',
                    region,
                }
            };

            await api.graphql(graphqlOperation(AddComment, variables));

            expect(spyon).toBeCalledWith(url, init);
        });
    });

    describe('configure test', () => {
        test('without aws_project_region', () => {
            const api = new API({});

            const options = {
                myoption: 'myoption'
            }

            expect(api.configure(options)).toEqual({ "endpoints": [], "myoption": "myoption" });
        });

        test('with aws_project_region', () => {
            const api = new API({});

            const options = {
                aws_project_region: 'region',
                aws_cloud_logic_custom
            }

            expect(api.configure(options)).toEqual({
                aws_cloud_logic_custom,
                aws_project_region: 'region',
                endpoints: aws_cloud_logic_custom,
                header: {},
                region: 'region'
            });
        });
    });



    describe('get test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'get').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            await api.get('apiName', 'path', 'init');

            expect(spyon2).toBeCalledWith('endpointpath', 'init');

        });

        test('custom_header', async () => {
            Logger.LOG_LEVEL = 'DEBUG';
            const custom_config = {
                API: {
                    endpoints: [
                        {
                            name: 'apiName',
                            endpoint: 'https://www.amazonaws.com',
                            custom_header: () => { return { Authorization: 'mytoken' }}
                        }
                    ]
                }
            };
            const api = new API({});
            api.configure(custom_config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            const spyonRequest = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res({});
                });
            });
            console.log('api options', JSON.stringify(api._options, null, 2));
            await api.get('apiName', 'path', {});

            expect(spyonRequest).toBeCalledWith({
                "data": null, 
                "headers": {"Authorization": "mytoken"}, 
                "host": "www.amazonaws.compath", 
                "method": "GET", 
                "path": "/", 
                "signerServiceInfo": undefined, 
                "url": "https://www.amazonaws.compath/"
            }    , undefined);

        });

        test('query-string on init', async () => {
            const resp = {data: [{name: 'Bob'}]};

            const options = {
                aws_project_region: 'region',
                aws_cloud_logic_custom
            };

            const api = new API(options);
            const creds = {
                secretAccessKey: 'secret',
                accessKeyId: 'access',
                sessionToken: 'token'
            };

            const creds2 = {
                secret_key: 'secret',
                access_key: 'access',
                session_token: 'token'
            };

            const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
                return new Promise((res, rej) => {
                    res(creds);
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });
            const spyonSigner = jest.spyOn(Signer, 'sign').mockImplementationOnce(() => {
                return { headers: {}};
            });

            const spyAxios = jest.spyOn(axios, 'default').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(resp);
                });
            });
            
            const init = {
                queryStringParameters: {
                    'ke:y3': 'val:ue 3'
                }
            }
            await api.get('apiName', '/items', init);
            const expectedParams = {"data": null, "headers": {}, "host": undefined, "method": "GET", "path": "/", "url": "endpoint/items?ke%3Ay3=val%3Aue%203"};
            expect(spyonSigner).toBeCalledWith( expectedParams, creds2 , { region: 'us-east-1', service: 'execute-api'});
        });

        test('query-string on init-custom-auth', async () => {
            const resp = {data: [{name: 'Bob'}]};

            const options = {
                aws_project_region: 'region',
                aws_cloud_logic_custom
            };

            const api = new API(options);
            const creds = {
                secretAccessKey: 'secret',
                accessKeyId: 'access',
                sessionToken: 'token'
            };

            const creds2 = {
                secret_key: 'secret',
                access_key: 'access',
                session_token: 'token'
            };

            const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
                return new Promise((res, rej) => {
                    res(creds);
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });
            const spyonRequest = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return { headers: {}};
            });

            const spyAxios = jest.spyOn(axios, 'default').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(resp);
                });
            });
            
            const init = {
                queryStringParameters: {
                    'ke:y3': 'val:ue 3'
                },
                headers: {
                    Authorization: 'apikey'
                }
            }
            await api.get('apiName', '/items', init);
            const expectedParams = {"data": null, "headers": {"Authorization": "apikey"}, "host": undefined, "method": "GET", "path": "/", "signerServiceInfo": undefined, "url": "endpoint/items?ke%3Ay3=val%3Aue%203"};
            expect(spyonRequest).toBeCalledWith( expectedParams, undefined );
        });
        test('query-string on init and url', async () => {
            const resp = {data: [{name: 'Bob'}]};

            const options = {
                aws_project_region: 'region',
                aws_cloud_logic_custom
            };

            const api = new API(options);
            const creds = {
                secretAccessKey: 'secret',
                accessKeyId: 'access',
                sessionToken: 'token'
            };

            const creds2 = {
                secret_key: 'secret',
                access_key: 'access',
                session_token: 'token'
            };

            const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
                return new Promise((res, rej) => {
                    res(creds);
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });
            const spyonSigner = jest.spyOn(Signer, 'sign').mockImplementationOnce(() => {
                return { headers: {}};
            });

            const spyAxios = jest.spyOn(axios, 'default').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(resp);
                });
            });
            
            const init = {
                queryStringParameters: {
                    'key2': 'value2_real'
                }
            }
            await api.get('apiName', '/items?key1=value1&key2=value', init);
            const expectedParams = {"data": null, "headers": {}, "host": undefined, "method": "GET", "path": "/", "url": "endpoint/items?key1=value1&key2=value2_real"};
            expect(spyonSigner).toBeCalledWith( expectedParams, creds2 , { region: 'us-east-1', service: 'execute-api'});
        });

        test('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'get').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return '';
            });

            expect.assertions(1);
            try {
                await api.get('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('Api apiName does not exist');
            }

        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err no current credentials');
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            const spyon4 = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            await api.get('apiName', 'path', 'init');
            expect(spyon4).toBeCalled();
        });

        test('no restclient instance', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(API.prototype, 'createInstance').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect.assertions(1);
            try {
                await api.get('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('err');
            }

        });
    });

    describe('post test', () => {

        test('happy case', async () => {
            const api = new API({
                region: 'region-2',
            });
            const options = {
                aws_project_region: 'region',
                aws_cloud_logic_custom
            };

            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'post').mockImplementationOnce(() => {
                console.log('spyon2, post');
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            api.configure(options);
            await api.post('apiName', 'path', 'init');

            expect(spyon2).toBeCalledWith('endpointpath', 'init');

        });

        test.skip('endpoint length 0', async () => {
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'post').mockImplementationOnce(() => {

                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return '';
            });

            const api = new API(config);
            expect.assertions(1);
            try {
                await api.post('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('Api apiName does not exist');
            }

        });

        test('cred not ready', async () => {
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            const api = new API(config);
            const spyon4 = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            await api.post('apiName', 'path', 'init');
            expect(spyon4).toBeCalled();

        });

        test('no restclient instance', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(API.prototype, 'createInstance').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect.assertions(1);
            try {
                await api.post('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('err');
            }

        });
    });

    describe('put test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'put').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            await api.put('apiName', 'path', 'init');

            expect(spyon2).toBeCalledWith('endpointpath', 'init');

        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'put').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return '';
            });

            expect.assertions(1);
            try {
                await api.put('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('Api apiName does not exist');
            }

        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            const spyon4 = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            await api.put('apiName', 'path', 'init');
            expect(spyon4).toBeCalled();

        });

        test('no restclient instance', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(API.prototype, 'createInstance').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect.assertions(1);
            try {
                await api.put('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('err');
            }

        });
    });

    describe('patch test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'patch').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            await api.patch('apiName', 'path', 'init');

            expect(spyon2).toBeCalledWith('endpointpath', 'init');


        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'patch').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return '';
            });

            expect.assertions(1);
            try {
                await api.patch('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('Api apiName does not exist');
            }

        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            const spyon4 = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            await api.patch('apiName', 'path', 'init');
            expect(spyon4).toBeCalled();

        });

        test('no restclient instance', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(API.prototype, 'createInstance').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect.assertions(1);
            try {
                await api.patch('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('err');
            }

        });
    });

    describe('del test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'del').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            await api.del('apiName', 'path', 'init');

            expect(spyon2).toBeCalledWith('endpointpath', 'init');


        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'del').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return '';
            });

            expect.assertions(1);
            try {
                await api.del('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('Api apiName does not exist');
            }

        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            const spyon4 = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            await api.del('apiName', 'path', 'init');
            expect(spyon4).toBeCalled();

        });

        test('no restclient instance', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(API.prototype, 'createInstance').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect.assertions(1);
            try {
                await api.del('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('err');
            }

        });
    });

    describe('head test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'head').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            await api.head('apiName', 'path', 'init');

            expect(spyon2).toBeCalledWith('endpointpath', 'init');

        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'head').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return '';
            });

            expect.assertions(1);
            try {
                await api.head('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('Api apiName does not exist');
            }

        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            const spyon4 = jest.spyOn(RestClient.prototype, '_request').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            await api.head('apiName', 'path', 'init');
            expect(spyon4).toBeCalled();

        });

        test('no restclient instance', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(API.prototype, 'createInstance').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect.assertions(1);
            try {
                await api.head('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('err');
            }

        });
    });

    describe('endpoint test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            await api.endpoint('apiName');

            expect(spyon).toBeCalledWith('apiName');

        });

        test('no restclient instance', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(API.prototype, 'createInstance').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            expect.assertions(1);
            try {
                await api.endpoint('apiName');
            } catch (e) {
                expect(e).toBe('err');
            }

        });
    });



});


