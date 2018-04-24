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

jest.mock('amazon-cognito-identity-js/lib/CognitoUserSession', () => {
    const CognitoUserSession = () => {}

    CognitoUserSession.prototype.CognitoUserSession = (options) => {
        CognitoUserSession.prototype.options = options;
        return CognitoUserSession;
    }

    CognitoUserSession.prototype.getIdToken = () => {
        return {
            getJwtToken: () => {
                return null;
            }
        }
    }

    return CognitoUserSession;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoIdToken', () => {
    const CognitoIdToken = () => {}

    CognitoIdToken.prototype.CognitoIdToken = (value) => {
        CognitoIdToken.prototype.idToken = value;
        return CognitoIdToken;
    }

    CognitoIdToken.prototype.getJwtToken = () => {
        return 'jwtToken';
    }


    return CognitoIdToken;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUserPool', () => {
    const CognitoUserPool = () => {};

    CognitoUserPool.prototype.CognitoUserPool = (options) => {
        CognitoUserPool.prototype.options = options;
        return CognitoUserPool;
    }

    CognitoUserPool.prototype.getCurrentUser = () => {
        return "currentUser";
    }

    CognitoUserPool.prototype.signUp = (username, password, signUpAttributeList, validationData, callback) => {
        callback(null, 'signUpResult');
    }

    return CognitoUserPool;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUser', () => {
    const CognitoUser = () => {}

    CognitoUser.prototype.CognitoUser = (options) => {
        CognitoUser.prototype.options = options;
        return CognitoUser;
    }

    CognitoUser.prototype.getSession = (callback) => {
       // throw 3;
        callback(null, "session");
    }

    CognitoUser.prototype.getUserAttributes = (callback) => {
        callback(null, "attributes");
    }

    CognitoUser.prototype.getAttributeVerificationCode = (attr, callback) => {
        callback.onSuccess("success");
    }

    CognitoUser.prototype.verifyAttribute = (attr, code, callback) => {
        callback.onSuccess("success");
    }

    CognitoUser.prototype.authenticateUser = (authenticationDetails, callback) => {
        callback.onSuccess('session');
    }

    CognitoUser.prototype.sendMFACode = (code, callback) => {
        callback.onSuccess('session');
    }

    CognitoUser.prototype.resendConfirmationCode = (callback) => {
        callback(null, 'result');
    }

    CognitoUser.prototype.changePassword = (oldPassword, newPassword, callback) => {
        callback(null, 'SUCCESS');
    }

    CognitoUser.prototype.forgotPassword = (callback) => {
        callback.onSuccess();
    }

    CognitoUser.prototype.confirmPassword = (code, password, callback) => {
        callback.onSuccess();
    }

    CognitoUser.prototype.signOut = () => {

    }

    CognitoUser.prototype.confirmRegistration = (confirmationCode, forceAliasCreation, callback) => {
        callback(null, 'Success');
    }

    CognitoUser.prototype.completeNewPasswordChallenge = (password, requiredAttributes, callback) => {
        callback.onSuccess('session');
    }

    CognitoUser.prototype.updateAttributes = (attributeList, callback) {
        callback(null, 'SUCCESS');
    }

    CognitoUser.prototype.getMFAOptions = (callback) => {
        callback(null, 'mfaOptions');
    }

    CognitoUser.prototype.disableMFA = (callback) => {
        callback(null, 'Success');
    }

    CognitoUser.prototype.enableMFA = (callback) => {
        callback(null, 'Success');
    }

    CognitoUser.prototype.associateSoftwareToken = (callback) => {
        callback.associateSecretCode('secretCode');
        //callback.onFailure()
    }

    CognitoUser.prototype.verifySoftwareToken = (challengeAnswer, device, callback) => {
        callback.onSuccess('Success');
    };

    CognitoUser.prototype.setUserMfaPreference = (smsMfaSettings, totpMfaSettings, callback) => {
        callback(null, 'Success');
    }

    return CognitoUser;
});



import { AuthOptions, SignUpParams } from '../../src/Auth/types';
import Auth from '../../src/Auth/Auth';
import Cache from '../../src/Cache';
import { CognitoUserPool, CognitoUser, CognitoUserSession, CognitoIdToken, CognitoAccessToken } from 'amazon-cognito-identity-js';
import { CognitoIdentityCredentials } from 'aws-sdk';


const authOptions = {
    Auth: {
        userPoolId: "awsUserPoolsId",
        userPoolWebClientId: "awsUserPoolsWebClientId",
        region: "region",
        identityPoolId: "awsCognitoIdentityPoolId"
    }
}

const authOptionsWithNoUserPoolId = {
    Auth: {
        userPoolId: null,
        userPoolWebClientId: "awsUserPoolsWebClientId",
        region: "region",
        identityPoolId: "awsCognitoIdentityPoolId"
    }
}

const userPool = new CognitoUserPool({
    UserPoolId: authOptions.Auth.userPoolId,
    ClientId: authOptions.Auth.userPoolWebClientId
});

const idToken = new CognitoIdToken({IdToken: 'idToken'});
const accessToken = new CognitoAccessToken({AccessToken: 'accessToken'});

const session = new CognitoUserSession({
    IdToken: idToken,
    AccessToken: accessToken
});

const user = new CognitoUser({
    Username: "username",
    Pool: userPool
});

describe('auth unit test', () => {
    describe('getMFAOptions test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "getMFAOptions");
            expect(await auth.getMFAOptions(user)).toBe('mfaOptions');
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test('err case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "getMFAOptions").mockImplementationOnce((callback) => {
                callback('err', null);
            });
            try {
                await auth.getMFAOptions(user);
            } catch (e) {
                expect(e).toBe('err');
            }
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });

    describe('disableMFA test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "disableMFA");
            expect(await auth.disableSMS(user)).toBe('Success');
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test('err case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "disableMFA").mockImplementationOnce((callback) => {
                callback('err', null);
            });
            try {
                await auth.disableSMS(user);
            } catch (e) {
                expect(e).toBe('err');
            }
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });

    describe('enableMFA test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "enableMFA");
            expect(await auth.enableSMS(user)).toBe('Success');
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test('err case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "enableMFA").mockImplementationOnce((callback) => {
                callback('err', null);
            });
            try {
                await auth.enableSMS(user);
            } catch (e) {
                expect(e).toBe('err');
            }
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });

    describe('setupTOTP test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "associateSoftwareToken");
            expect(await auth.setupTOTP(user)).toBe('secretCode');
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test('err case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "associateSoftwareToken").mockImplementationOnce((callback) => {
                callback.onFailure('err');
            });
            try {
                await auth.setupTOTP(user);
            } catch (e) {
                expect(e).toBe('err');
            }
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });

    describe('verifyTotpToken test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "verifySoftwareToken");
            expect(await auth.verifyTotpToken(user, 'challengeAnswer')).toBe('Success');
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test('err case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "verifySoftwareToken").mockImplementationOnce((challengeAnswer, device, callback) => {
                callback.onFailure('err');
            });
            try {
                await auth.verifyTotpToken(user, 'challengeAnswer');
            } catch (e) {
                expect(e).toBe('err');
            }
            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });

    describe('setPreferredMFA test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "setUserMfaPreference");
            expect(await auth.setPreferredMFA(user, 'TOTP')).toBe('Success');
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        'User has not verified software token mfa'

        test('totp not setup but NOMFA chosed, disable sms', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "setUserMfaPreference").mockImplementationOnce((smsMfaSettings, totpMfaSettings, callback) => {
                const err = {
                    message: 'User has not verified software token mfa'
                }
                callback(err, null);
            });
            const spyon2 = jest.spyOn(Auth.prototype, 'disableSMS').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('Success');
                });
            });

            await auth.setPreferredMFA(user, 'NOMFA');
            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });
        
        test('totp not setup but MFA chosed, enable sms', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "setUserMfaPreference").mockImplementationOnce((smsMfaSettings, totpMfaSettings, callback) => {
                const err = {
                    message: 'User has not verified software token mfa'
                }
                callback(err, null);
            });
            const spyon2 = jest.spyOn(Auth.prototype, 'enableSMS').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('Success');
                });
            });

            await auth.setPreferredMFA(user, 'SMS');
            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        }); 

        test('totp not setup but TOTP chosed', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "setUserMfaPreference").mockImplementationOnce((smsMfaSettings, totpMfaSettings, callback) => {
                const err = {
                    message: 'User has not verified software token mfa'
                }
                callback(err, null);
            });

            try {
                await auth.setPreferredMFA(user, 'TOTP');
            } catch (e) {
                expect(e).not.toBeNull();
            }
            expect(spyon).toBeCalled();
   
            spyon.mockClear();
        });

        test('totp not setup but TOTP chosed', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "setUserMfaPreference").mockImplementationOnce((smsMfaSettings, totpMfaSettings, callback) => {
                const err = {
                    message: 'other message'
                }
                callback(err, null);
            });

            try {
                await auth.setPreferredMFA(user, 'TOTP');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        
            expect(spyon).toBeCalled();
   
            spyon.mockClear();
        });

        test('incorrect mfa type', async () => {
            const auth = new Auth(authOptions);
            try {
                await auth.setPreferredMFA(user, 'incorrect mfa type');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });
});