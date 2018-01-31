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

jest.mock('../../src/Common/Builder', () => {
    return {
        default: null
    };
});

import API from '../../src/API/API';
import Auth from '../../src/Auth';
import { RestClient } from '../../src/API/RestClient';

const config = {
    API: {
        region: 'region',
        header: {},

    }
};

describe('API test', () => {
    describe('configure test', () => {
        test('without aws_project_region', () => {
            const api = new API({});

            const options = {
                myoption: 'myoption'
            }

            expect(api.configure(options)).toEqual({"myoption": "myoption"});
        });

        test('with aws_project_region', () => {
            const api = new API({});
            const aws_cloud_logic_custom = [{
                    "id":"lh3s27sl16",
                    "name":"todosCRUD",
                    "description":"",
                    "endpoint":"https://lh3s27sl16.execute-api.us-east-1.amazonaws.com/Development",
                    "region":"us-east-1",
                    "paths":["/todos","/todos/123"]}];

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
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'get').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            try {
                await api.get('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('No credentials');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
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

            spyon.mockClear();
        });
    });

    describe('post test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            await api.post('apiName', 'path', 'init');

            expect(spyon2).toBeCalledWith('endpointpath', 'init');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            expect.assertions(1);
            try {
                await api.post('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('Api apiName does not exist');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'post').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            try {
                await api.post('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('No credentials');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
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

            spyon.mockClear();
        });
    });

    describe('put test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'put').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            try {
                await api.put('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('No credentials');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
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

            spyon.mockClear();
        });
    });
    
    describe('del test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'del').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            try {
                await api.del('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('No credentials');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
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

            spyon.mockClear();
        });
    });

    describe('head test', () => {
        test('happy case', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test.skip('endpoint length 0', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
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

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('cred not ready', async () => {
            const api = new API(config);
            const spyon = jest.spyOn(Auth, 'currentCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            const spyon2 = jest.spyOn(RestClient.prototype, 'head').mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon3 = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            expect.assertions(1);
            try {
                await api.head('apiName', 'path', 'init');
            } catch (e) {
                expect(e).toBe('No credentials');
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
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

            spyon.mockClear();
        });
    });

    describe('endpoint test', () => {
        test('happy case', async() => {
            const api = new API(config);
            const spyon = jest.spyOn(RestClient.prototype, 'endpoint').mockImplementationOnce(() => {
                return 'endpoint';
            });

            await api.endpoint('apiName');

            expect(spyon).toBeCalledWith('apiName');

            spyon.mockClear();
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

            spyon.mockClear();
        });
    });
});