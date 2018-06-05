import { Credentials } from '../../src/Common/Credentials';
import { CognitoIdentityCredentials } from 'aws-sdk';

const authClass = {
    currentUserCredentials() {
        return Promise.resolve('cred');
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
            const credentials = new Credentials(null);
            
            credentials.setAuthClass(authClass);
            expect(await credentials.get()).toBe('cred');
        });
    });

   describe.skip('refreshFederatedToken test', () => {
        test('federated info and not expired, then refresh it successfully', async () => {
            const credentials = new Credentials(null);
        });

        test('federated info and expired, then refresh it successfully', async () => {
            const credentials = new Credentials(null);
        });

        test('with federated info and expired, no refresh handler provided', async () => {
            const credentials = new Credentials(null);
        });

        test('with federated info and expired, then refresh failed', async () => {
            const credentials = new Credentials(null);
        });
    });

});