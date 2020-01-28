import Amplify, { Logger, Hub } from '@aws-amplify/core';
import * as _ from 'lodash';
var logger = new Logger('AuthDecorator');
function check(authState, Auth) {
    // check for current authenticated user to init authState
    Auth.currentAuthenticatedUser()
        .then(function (user) {
        logger.debug('has authenticated user', user);
        authState.next({ state: 'signedIn', user: user });
    })
        .catch(function (err) {
        logger.debug('no authenticated user', err);
        authState.next({ state: 'signedOut', user: null });
    });
}
function listen(authState) {
    var config = Amplify.configure(null);
    if (_.has(config, 'Auth.oauth')) {
        Hub.listen('auth', {
            onHubCapsule: function (capsule) {
                var channel = capsule.channel, payload = capsule.payload;
                if (channel === 'auth') {
                    var username = payload.data.username;
                    logger.debug('authentication oauth event', payload);
                    authState.next({ state: payload.event, user: { username: username } });
                }
            },
        }, 'angularAuthListener');
    }
}
function decorateSignIn(authState, Auth) {
    var _signIn = Auth.signIn;
    Auth.signIn = function (username, password) {
        return _signIn
            .call(Auth, username, password)
            .then(function (user) {
            logger.debug('signIn success');
            if (!user.challengeName) {
                authState.next({ state: 'signedIn', user: user });
                return user;
            }
            logger.debug('signIn challenge: ' + user.challengeName);
            if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                authState.next({ state: 'requireNewPassword', user: user });
            }
            else if (user.challengeName === 'MFA_SETUP') {
                authState.next({ state: 'setupMFA', user: user });
            }
            else if (user.challengeName === 'SMS_MFA' ||
                user.challengeName === 'SOFTWARE_TOKEN_MFA') {
                authState.next({ state: 'confirmSignIn', user: user });
            }
            else {
                logger.debug('warning: unhandled challengeName ' + user.challengeName);
            }
            return user;
        })
            .catch(function (err) {
            logger.debug('signIn error', err);
            throw err;
        });
    };
}
function decorateSignOut(authState, Auth) {
    var _signOut = Auth.signOut;
    Auth.signOut = function () {
        return _signOut
            .call(Amplify.Auth)
            .then(function (data) {
            logger.debug('signOut success');
            authState.next({ state: 'signedOut', user: null });
            return data;
        })
            .catch(function (err) {
            logger.debug('signOut error', err);
            throw err;
        });
    };
}
function decorateSignUp(authState, Auth) {
    var _signUp = Auth.signUp;
    Auth.signUp = function (username, password, email, phone_number) {
        return _signUp
            .call(Auth, username, password, email, phone_number)
            .then(function (data) {
            logger.debug('signUp success');
            authState.next({ state: 'confirmSignUp', user: { username: username } });
            return data;
        })
            .catch(function (err) {
            logger.debug('signUp error', err);
            throw err;
        });
    };
}
function decorateConfirmSignUp(authState, Auth) {
    var _confirmSignUp = Auth.confirmSignUp;
    Auth.confirmSignUp = function (username, code) {
        return _confirmSignUp
            .call(Auth, username, code)
            .then(function (data) {
            logger.debug('confirmSignUp success');
            authState.next({ state: 'signIn', user: { username: username } });
            return data;
        })
            .catch(function (err) {
            logger.debug('confirmSignUp error', err);
            throw err;
        });
    };
}
export function authDecorator(authState, authModule) {
    check(authState, authModule);
    listen(authState);
    decorateSignIn(authState, authModule);
    decorateSignOut(authState, authModule);
    decorateSignUp(authState, authModule);
    decorateConfirmSignUp(authState, authModule);
}
//# sourceMappingURL=auth.decorator.js.map