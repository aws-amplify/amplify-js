import { Credentials } from '../../src/Common/Credentials';
import { CognitoIdentityCredentials } from 'aws-sdk';

const authClass = {
    currentSession() {
        return Promise.resolve();
    }
}

const cacheClass = {
    getItem() {
        return null;
    }
}

const cognitoCredentialSpyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'getPromise').mockImplementation(() => {
    return new Promise((res, rej) => {
        res('cred');
    });
})

const options = {
    userPoolId: "awsUserPoolsId",
    userPoolWebClientId: "awsUserPoolsWebClientId",
    region: "region",
    identityPoolId: "awsCognitoIdentityPoolId",
    mandatorySignIn: false
}

describe('Credentials test', () => {
    describe('configure test', () => {
        test('happy case', () => {
            const config = {
                attr: 'attr'
            }

            const credentials = new Credentials(null);
            expect(credentials.configure(config)).toEqual({
                attr: 'attr'
            });
        });
    });

    describe('setAuthClass and setCacheClass', () => {
        test('happy case', () => {
            const credentials = new Credentials(null);
            credentials.setAuthClass(authClass);
            credentials.setCacheClass(cacheClass);
        });
    });

    describe('getCredSource test', () => {
        test('happy case', () => {
            const credentials = new Credentials(null);
            credentials['_credentials_source'] = 'source';
            expect(credentials.getCredSource()).toBe('source');

        });
    });

    describe('get test', () => {
        test('credentials in the memory and not expired', async () => {
            const credentials = new Credentials(null);
            credentials['_credentials'] = {
                expired: false,
                expireTime: new Date().getTime() + 20*60*1000
            }
            expect(await credentials.get()).toEqual(credentials['_credentials']);
        
        });

        test('credentials not in memory or being expired', async () => {
            const spyon = jest.spyOn(Credentials.prototype, 'currentUserCredentials').mockImplementationOnce(() => {
                return Promise.resolve('cred');
            });
            const credentials = new Credentials(null);
            
            expect(await credentials.get()).toBe('cred');

            spyon.mockClear();
        });
    });

    describe('currentUserCredentials test', () => {
        test('session case', async () => {
            const session = {
                getIdToken() {
                    return {
                        getJwtToken() {
                            return 'token';
                        }
                    }
                }
            };

            const credentials = new Credentials(options);
            const spyon = jest.spyOn(authClass, 'currentSession').mockImplementationOnce(() => {
                return Promise.resolve(session);
            });

            credentials.setAuthClass(authClass);
            credentials.setCacheClass(cacheClass);

            expect(await credentials.currentUserCredentials()).not.toBeNull();

            spyon.mockClear();

        });   
    });
});