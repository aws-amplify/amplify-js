jest.mock('../../src/Auth', () => {
    return;
});

import Credentials from '../../src/Credentials/Credentials';
import CognitoCredentials from '../../src/Credentials/Providers/CognitoCredentials';
import { Parser } from '../../src/Common';

describe('Credentials test', () => {
    describe('configure test', () => {
        test('happy case', () => {
            const credentials = new Credentials();

            const spyon = jest.spyOn(Parser, "parseMobilehubConfig").mockImplementationOnce((config) => {
                return config;
            });

            const spyon2 = jest.spyOn(CognitoCredentials.prototype, 'configure').mockImplementation(() => {
                return;
            });

            expect(credentials.configure({
                Credentials: {
                    userpoolid: 'userpoolid'
                }
            })).toEqual({ userpoolid: 'userpoolid' });
            expect(spyon).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

    describe('setCredentials test', () => {
        test('happy case', async () => {
            const credentials = new Credentials();

            const spyon = jest.spyOn(CognitoCredentials.prototype, 'setCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            expect(await credentials.setCredentials()).toBe('cred');

            spyon.mockClear();
        });

        test('error case', async () => {
            const credentials = new Credentials();

            const spyon = jest.spyOn(CognitoCredentials.prototype, 'setCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });

            try {
                await credentials.setCredentials();
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });

        test('no provider', async () => {
            const credentials = new Credentials();

            const spyon = jest.spyOn(CognitoCredentials.prototype, 'setCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            expect(await credentials.setCredentials({providerName: 'no provider'})).toBeNull();

            spyon.mockClear();
        });
    });

    describe('getCredentials test', () => {
        test('happy case', async () => {
            const credentials = new Credentials();

            const spyon = jest.spyOn(CognitoCredentials.prototype, 'getCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            expect(await credentials.getCredentials()).toBe('cred');

            spyon.mockClear();
        });

        test('error case', async () => {
            const credentials = new Credentials();

            const spyon = jest.spyOn(CognitoCredentials.prototype, 'getCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });

            try {
                await credentials.getCredentials();
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });

        test('no provider', async () => {
            const credentials = new Credentials();

            const spyon = jest.spyOn(CognitoCredentials.prototype, 'getCredentials').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('cred');
                });
            });

            expect(await credentials.getCredentials({providerName: 'no provider'})).toBeNull();

            spyon.mockClear();
        });
    });

    describe('removeCredentials test', () => {
        test('happy case', () => {
            const credentials = new Credentials();

             const spyon = jest.spyOn(CognitoCredentials.prototype, 'removeCredentials').mockImplementationOnce(() => {
                return;
            });

            credentials.removeCredentials();
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });

        test('no provider', () => {
            const credentials = new Credentials();

             const spyon = jest.spyOn(CognitoCredentials.prototype, 'removeCredentials').mockImplementationOnce(() => {
                return;
            });

            credentials.removeCredentials({providerName: 'no provider'});

            spyon.mockClear();
        });
    });

    describe('essentialCredentials test', () => {
        test('happy case', () => {
            const credentials = new Credentials();

             const spyon = jest.spyOn(CognitoCredentials.prototype, 'essentialCredentials').mockImplementationOnce(() => {
                return;
            });

            credentials.essentialCredentials({credentials: 'cred'});
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });

        test('no provider', () => {
            const credentials = new Credentials();

             const spyon = jest.spyOn(CognitoCredentials.prototype, 'essentialCredentials').mockImplementationOnce(() => {
                return;
            });

            credentials.essentialCredentials({providerName: 'no provider', credentials: 'cred'});

            spyon.mockClear();
        });
    });
});