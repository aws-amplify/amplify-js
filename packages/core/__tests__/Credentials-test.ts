import { Credentials } from '../src/Credentials';
import { AWS } from '../src/Facet';
import Amplify from '../src/Amplify';
import { CognitoIdentityCredentials } from 'aws-sdk';

const authClass = {
    getModuleName() {
        return 'Auth';
    }
    currentUserCredentials() {
        return Promise.resolve('cred');
    }
}

const cacheClass = {
    getModuleName() {
        return 'Cache';
    }

    getItem() {
        return null;
    }
}

const cognitoCredentialSpyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'get').mockImplementation((callback) => {
    callback(null);
})

const options = {
    userPoolId: "awsUserPoolsId",
    userPoolWebClientId: "awsUserPoolsWebClientId",
    region: "region",
    identityPoolId: "awsCognitoIdentityPoolId",
    mandatorySignIn: false
}

jest.spyOn(Date.prototype, 'getTime').mockImplementation(() => {
    return 0;
});

AWS.config.credentials = undefined;

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

    describe('get test', () => {
        test('credentials in the memory and not expired', async () => {
            Amplify.register(authClass);
            Amplify.register(cacheClass);
            const credentials = new Credentials(null);
            
            credentials['_credentials'] = {
                expired: false,
                expireTime: 20*60*1000
            }
            expect(await credentials.get()).toEqual(credentials['_credentials']);
            
        });

        test('credentials not in memory or being expired', async () => {
            const credentials = new Credentials(null);
            
            expect(await credentials.get()).toBe('cred');
        });
    });
});