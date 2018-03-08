
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

jest.mock('../../src/Common/Signer', () => {
    return {
        default: {
            sign: () => {
                return {
                    data: 'data',
                    headers: {}
                };
            }
        }
    }
});

jest.mock('axios', () => {
    return {
        default: (signed_params) => {
            return new Promise((res, rej) => {
                res({
                    data: 'data'
                })
            });
        }
    }
});

jest.mock('../../src/Common/Builder', () => {
    return {
        default: null
    };
});

import { RestClient } from '../../src/API/RestClient';
import * as AWS from 'aws-sdk';
import Signer from '../../src/Common/Signer';
import Auth from '../../src/Auth';
import axios from 'axios';

const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementation(() => {
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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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

        test('fetch with signed request', async () => {
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {return 'response JSON'}
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
            window.fetch = jest.fn().mockImplementationOnce((signed_params_url, signed_params) => {
                return new Promise((res, rej) => {
                    res({
                        status: '200',
                        json: () => {
                            return signed_params.data;
                        }
                    });
                });
            });

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
