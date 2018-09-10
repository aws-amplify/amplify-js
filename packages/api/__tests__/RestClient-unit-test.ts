jest.mock('@aws-amplify/core/lib/Signer', () => {
    return {
        default: {
            sign: (request: any, access_info: any, service_info?: any) => {
                return request;
            }   
        }
    }
});

jest.mock('axios', () => {
    return {
        default: (signed_params) => {
            return new Promise((res, rej) => {
                if (signed_params.reject) {
                    rej({
                        data: 'error'
                    });
                } else {
                    res({
                        data: 'data'
                    });
                }
            });
        }
    };
});

import { RestClient } from '../src/RestClient';
import * as AWS from 'aws-sdk';
import { Signer, Credentials }  from '@aws-amplify/core';
import axios from 'axios';

const spyon = jest.spyOn(Credentials, 'get').mockImplementation(() => {
    return new Promise((res, rej) => {
        res({
            secretAccessKey: 'secretAccessKey',
            accessKeyId: 'accessKeyId',
            sessionToken: 'sessionToken' 
        });
    })
});

describe('RestClient test', () => {
    describe('ajax', () => {
        test('fetch with signed request', async () => {
            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect(await restClient.ajax('url', 'method', {})).toEqual('data');
        });

        test('fetch with signed failing request', async () => {
            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);
            expect(restClient.ajax('url', 'method', {reject: true})).rejects.toEqual({data: 'error'});
        });

        test('fetch with signed request', async () => {
            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect(await restClient.ajax('url', 'method', {})).toEqual('data');
        });

        test('ajax with no credentials', async () => {
            const apiOptions = {
                headers: {},
                endpoints: {}
            };

            const restClient = new RestClient(apiOptions);

            try {
                await restClient.ajax('url', 'method', {});
            } catch (e) {
                expect(e).toBe('credentials not set for API rest client ');
            }
        });

        test('ajax with extraParams', async () => {
            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect(await restClient.ajax('url', 'method', {body: 'body'})).toEqual('data');
        });

        test('ajax with Authorization header', async () => {
            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect(await restClient.ajax('url', 'method', {headers: {Authorization: 'authorization'}})).toEqual('data');
        });
    });

    describe('get test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(RestClient.prototype, 'ajax');

            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect.assertions(2);
            await restClient.get('url', {});
       
            expect(spyon.mock.calls[0][0]).toBe('url');
            expect(spyon.mock.calls[0][1]).toBe('GET');

            spyon.mockClear();
        });
    });

    describe('put test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(RestClient.prototype, 'ajax');

            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect.assertions(3);
            await restClient.put('url', 'data');
            
            expect(spyon.mock.calls[0][0]).toBe('url');
            expect(spyon.mock.calls[0][1]).toBe('PUT');
            expect(spyon.mock.calls[0][2]).toBe('data');
            spyon.mockClear();
        });
    });

    describe('patch test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(RestClient.prototype, 'ajax');

            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect.assertions(3);
            await restClient.patch('url', 'data');
            
            expect(spyon.mock.calls[0][0]).toBe('url');
            expect(spyon.mock.calls[0][1]).toBe('PATCH');
            expect(spyon.mock.calls[0][2]).toBe('data');
            spyon.mockClear();
        });
    });

    describe('post test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(RestClient.prototype, 'ajax');

            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect.assertions(3);
            await restClient.post('url', 'data');
            
            expect(spyon.mock.calls[0][0]).toBe('url');
            expect(spyon.mock.calls[0][1]).toBe('POST');
            expect(spyon.mock.calls[0][2]).toBe('data');
            spyon.mockClear();
        });
    });

    describe('del test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(RestClient.prototype, 'ajax');

            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect.assertions(2);
            await restClient.del('url', {});
            
            expect(spyon.mock.calls[0][0]).toBe('url');
            expect(spyon.mock.calls[0][1]).toBe('DELETE');
            spyon.mockClear();
        });
    });

    describe('head test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(RestClient.prototype, 'ajax');

            const apiOptions = {
                headers: {},
                endpoints: {},
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect.assertions(2);
            await restClient.head('url', {});
            
            expect(spyon.mock.calls[0][0]).toBe('url');
            expect(spyon.mock.calls[0][1]).toBe('HEAD');
            spyon.mockClear();
        });
    });

    describe('endpoint test', () => {
        test('happy case', () => {
            const apiOptions = {
                headers: {},
                endpoints: [
                {
                    name: 'myApi',
                    endpoint: 'endpoint of myApi'
                },
                {
                    name: 'otherApi',
                    endpoint: 'endpoint of otherApi'
                }
                ],
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                },
                region: 'myregion'
            };

            const restClient = new RestClient(apiOptions);

            expect(restClient.endpoint('myApi')).toBe('endpoint of myApi');
        });

        test('custom endpoint', () => {
            const apiOptions = {
                headers: {},
                endpoints: [
                {
                    name: 'myApi',
                    endpoint: 'endpoint of myApi'
                },
                {
                    name: 'otherApi',
                    endpoint: 'endpoint of otherApi',
                    region: 'myregion',
                    service: 'myservice'
                }
                ],
                credentials: {
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                }
            };

            const restClient = new RestClient(apiOptions);

            expect(restClient.endpoint('otherApi')).toBe('endpoint of otherApi');
        });
    });
});
