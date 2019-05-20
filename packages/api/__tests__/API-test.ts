import axios from 'axios';
import { CognitoIdentityCredentials } from 'aws-sdk';

import { Signer, Credentials } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth'
import API, { graphqlOperation } from '../src/API';
import { GRAPHQL_AUTH_MODE } from '../src/types';
import { RestClient } from '../src/RestClient';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import { Signer, Credentials } from '@aws-amplify/core';
import { INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER } from '@aws-amplify/core/lib/constants';
import PubSub from '@aws-amplify/pubsub';
import Cache from '@aws-amplify/cache';
import * as Observable from 'zen-observable';

jest.mock('axios');

const config = {
    API: {
        region: 'region',
        header: {},

    }
};

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

        test('happy-case-query-ast', async () => {
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

            await api.graphql(graphqlOperation(doc, variables));

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
                capacityInBytes: 3000,
                itemMaxSize: 800,
                defaultTTL: 3000000,
                defaultPriority: 5,
                warningThreshold: 0.8,
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

        test('multi-auth default case AWS_IAM, using API_KEY as auth mode', async () => {
            expect.assertions(1);

            const cache_config = {
                capacityInBytes: 3000,
                itemMaxSize: 800,
                defaultTTL: 3000000,
                defaultPriority: 5,
                warningThreshold: 0.8,
                storage: window.localStorage
            };

            Cache.configure(cache_config);

            const spyon = jest.spyOn(RestClient.prototype, 'post').mockReturnValue(Promise.resolve({}));

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
                apiKey = 'secret-api-key';
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "AWS_IAM",
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
                'X-Api-Key': 'secret-api-key'
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

            await api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.API_KEY });

            expect(spyon).toBeCalledWith(url, init);

        });
        test('multi-auth default case api-key, using AWS_IAM as auth mode', async () => {
            expect.assertions(1);
            jest.spyOn(Credentials, 'get').mockReturnValue(Promise.resolve('cred'));

            jest.spyOn(CognitoIdentityCredentials.prototype, 'get').mockImplementation((callback) => {
                callback(null);
            })

            const spyon = jest.spyOn(RestClient.prototype, 'post').mockReturnValue(Promise.resolve({}));

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
                apiKey = 'secret-api-key';
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "API_KEY",
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

            const headers = {};

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

            await api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.AWS_IAM });

            expect(spyon).toBeCalledWith(url, init);
        });
        test('multi-auth default case api-key, using OIDC as auth mode', async () => {
            expect.assertions(1);
            const cache_config = {
                capacityInBytes: 3000,
                itemMaxSize: 800,
                defaultTTL: 3000000,
                defaultPriority: 5,
                warningThreshold: 0.8,
                storage: window.localStorage
            };

            Cache.configure(cache_config);

            jest.spyOn(Cache, 'getItem').mockReturnValue({ token: 'oidc_token' });

            const spyon = jest.spyOn(RestClient.prototype, 'post').mockReturnValue(Promise.resolve({}));

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
                apiKey = 'secret-api-key';
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "API_KEY",
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
                Authorization: 'oidc_token'
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

            await api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT });

            expect(spyon).toBeCalledWith(url, init);
        });
        test('multi-auth using OIDC as auth mode, but no federatedSign', async () => {
            expect.assertions(1);

            const cache_config = {
                capacityInBytes: 3000,
                itemMaxSize: 800,
                defaultTTL: 3000000,
                defaultPriority: 5,
                warningThreshold: 0.8,
                storage: window.localStorage
            };

            Cache.configure(cache_config);

            jest.spyOn(Cache, 'getItem').mockReturnValue(null);

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
                apiKey = 'secret-api-key';
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "API_KEY",
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

            expect(api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT }))
                .rejects.toThrowError("No federated jwt");


        });
        test('multi-auth using CUP as auth mode, but no userpool', async () => {
            expect.assertions(1);

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
                apiKey = 'secret-api-key';
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "API_KEY",
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

            expect(api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS }))
                .rejects.toThrowError("No userPool");

        });

        test('multi-auth using API_KEY as auth mode, but no api-key configured', async () => {
            expect.assertions(1);

            const cache_config = {
                capacityInBytes: 3000,
                itemMaxSize: 800,
                defaultTTL: 3000000,
                defaultPriority: 5,
                warningThreshold: 0.8,
                storage: window.localStorage
            };

            Cache.configure(cache_config);


            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "AWS_IAM",
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


            expect(api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.API_KEY }))
                .rejects.toThrowError("No api-key configured");


        });
        test('multi-auth using AWS_IAM as auth mode, but no credentials', async () => {
            expect.assertions(1);

            jest.spyOn(Credentials, 'get').mockReturnValue(Promise.reject());

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
                apiKey = 'secret-api-key';
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "API_KEY",
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

            expect(api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.AWS_IAM }))
                .rejects.toThrowError("No credentials");
        });

        test('multi-auth default case api-key, using CUP as auth mode', async () => {
            expect.assertions(1);
            const spyon = jest.spyOn(RestClient.prototype, 'post').mockReturnValue(Promise.resolve({}));

            jest.spyOn(Auth, 'currentSession').mockReturnValue({
                getAccessToken: () => ({
                    getJwtToken: () => ("Secret-Token")
                })
            });

            const api = new API(config);
            const url = 'https://appsync.amazonaws.com',
                region = 'us-east-2',
                variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
                apiKey = 'secret-api-key';
            api.configure({
                aws_appsync_graphqlEndpoint: url,
                aws_appsync_region: region,
                aws_appsync_authenticationType: "API_KEY",
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
                Authorization: 'Secret-Token'
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

            await api.graphql({ query: GetEvent, variables, authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS });

            expect(spyon).toBeCalledWith(url, init);
        });

        test('authMode on subscription', async () => {
            expect.assertions(1);

            jest.spyOn(RestClient.prototype, 'post')
                .mockImplementation(async (url, init) => ({
                    extensions: {
                        subscription: {
                            newSubscriptions: {}
                        }
                    }
                }));

            const cache_config = {
                capacityInBytes: 3000,
                itemMaxSize: 800,
                defaultTTL: 3000000,
                defaultPriority: 5,
                warningThreshold: 0.8,
                storage: window.localStorage
            };

            Cache.configure(cache_config);

            jest.spyOn(Cache, 'getItem').mockReturnValue({ token: 'id_token' });

            const spyon_Graphql = jest.spyOn(API.prototype, '_graphql');

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

            PubSub.subscribe = jest.fn(() => Observable.of({}));

            const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
                subscribeToEventComments(eventId: $eventId) {
                    eventId
                    commentId
                    content
                }
            }`;

            const doc = parse(SubscribeToEventComments);
            const query = print(doc);

            api.graphql({ query, variables, authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT }).subscribe();

            expect(spyon_Graphql).toBeCalledWith(expect.objectContaining({
                authMode: "OPENID_CONNECT"
            }), {});

        })

        test('happy-case-subscription', async (done) => {
            jest.spyOn(RestClient.prototype, 'post')
                .mockImplementation(async (url, init) => ({
                    extensions: {
                        subscription: {
                            newSubscriptions: {}
                        }
                    }
                }));

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

            PubSub.subscribe = jest.fn(() => Observable.of({}));

            const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
                subscribeToEventComments(eventId: $eventId) {
                    eventId
                    commentId
                    content
                }
            }`;

            const doc = parse(SubscribeToEventComments);
            const query = print(doc);

            const observable = api.graphql(graphqlOperation(query, variables)).subscribe({
                next: () => {
                    expect(PubSub.subscribe).toHaveBeenCalledTimes(1);
                    const subscribeOptions = PubSub.subscribe.mock.calls[0][1];
                    expect(subscribeOptions.provider).toBe(INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER);
                    done();
                }
            });

            expect(observable).not.toBe(undefined);
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

        test('with API options', () => {
            const api = new API({});

            const options = {
                API: {
                    aws_project_region: 'api-region',
                },
                aws_project_region: 'region',
                aws_appsync_region: 'appsync-region',
                aws_cloud_logic_custom
            }

            expect(api.configure(options)).toEqual({
                aws_cloud_logic_custom,
                aws_project_region: 'api-region',
                aws_appsync_region: 'appsync-region',
                endpoints: aws_cloud_logic_custom,
                header: {},
                region: 'api-region'
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
            const custom_config = {
                API: {
                    endpoints: [
                        {
                            name: 'apiName',
                            endpoint: 'https://www.amazonaws.com',
                            custom_header: () => { return { Authorization: 'mytoken' } }
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
            await api.get('apiName', 'path', {});

            expect(spyonRequest).toBeCalledWith({
                "data": null, 
                "headers": {"Authorization": "mytoken"}, 
                "host": "www.amazonaws.compath", 
                "method": "GET", 
                "path": "/",
                "responseType": "json",
                "signerServiceInfo": undefined, 
                "url": "https://www.amazonaws.compath/"
            }, undefined);

        });

        test('query-string on init', async () => {
            const resp = { data: [{ name: 'Bob' }] };

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
                return { headers: {} };
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
            const expectedParams = {"data": null, "headers": {}, "host": undefined, "method": "GET", "path": "/", "responseType": "json", "url": "endpoint/items?ke%3Ay3=val%3Aue%203"};
            expect(spyonSigner).toBeCalledWith( expectedParams, creds2 , { region: 'us-east-1', service: 'execute-api'});
        });

        test('query-string on init-custom-auth', async () => {
            const resp = { data: [{ name: 'Bob' }] };

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
                return { headers: {} };
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
            const expectedParams = {"data": null, "headers": {"Authorization": "apikey"}, "host": undefined, "method": "GET", "path": "/", "responseType": "json", "signerServiceInfo": undefined, "url": "endpoint/items?ke%3Ay3=val%3Aue%203"};
            expect(spyonRequest).toBeCalledWith( expectedParams, undefined );
        });
        test('query-string on init and url', async () => {
            const resp = { data: [{ name: 'Bob' }] };

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
                return { headers: {} };
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
            const expectedParams = {"data": null, "headers": {}, "host": undefined, "method": "GET", "path": "/", "responseType": "json", "url": "endpoint/items?key1=value1&key2=value2_real"};
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
                expect(e).toBe('API apiName does not exist');
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
                expect(e).toBe('API apiName does not exist');
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
                expect(e).toBe('API apiName does not exist');
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
                expect(e).toBe('API apiName does not exist');
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
                expect(e).toBe('API apiName does not exist');
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
                expect(e).toBe('API apiName does not exist');
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


