import { Subject } from 'rxjs/Subject';
import Amplify, { Logger, Hub } from 'aws-amplify';
import { AuthState } from './auth.state';
import * as _ from 'lodash';

const logger = new Logger('AuthDecorator');

function check(authState: Subject<AuthState>) {
  // check for current authenticated user to init authState
  Amplify.Auth.currentAuthenticatedUser()
    .then(user => {
      logger.debug('has authenticated user', user);
      authState.next({ state: 'signedIn', user });
    })
    .catch(err => {
      logger.debug('no authenticated user', err);
      authState.next({ state: 'signedOut', user: null });
    });
}

function listen(authState: Subject<AuthState>) {
  const config = Amplify.configure(null);
  if (_.has(config, 'Auth.oauth')) {
    Hub.listen('auth', {
      onHubCapsule: capsule => {
        const { channel, payload } = capsule;
        if (channel === 'auth') {
          const { username } = payload.data;
          logger.debug('authentication oauth event', payload);
          authState.next({ state: payload.event, user: { username} });
        }
      }
    },         'angularAuthListener');
  }
}

function decorateSignIn(authState: Subject<AuthState>) {
  const _signIn = Amplify.Auth.signIn;
  Amplify.Auth.signIn = (
    username: string,
    password: string
  ): Promise<any> => {
    return _signIn.call(Amplify.Auth, username, password)
      .then(user => {
        logger.debug('signIn success');
        if (!user.challengeName) {
          authState.next({ state: 'signedIn', user });
          return user;
        }

        logger.debug('signIn challenge: ' + user.challengeName);
        if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          authState.next({ state: 'requireNewPassword', user });
        } else if (user.challengeName === 'MFA_SETUP') {
          authState.next({ state: 'setupMFA', user });
        } else if (
          user.challengeName === 'SMS_MFA' ||
          user.challengeName === 'SOFTWARE_TOKEN_MFA'
        ) {
          authState.next({ state: 'confirmSignIn', user });
        } else {
          logger.debug('warning: unhandled challengeName ' + user.challengeName);
        }
        return user;
      })
      .catch(err => {
        logger.debug('signIn error', err);
        throw err;
      });
  };
}

function decorateSignOut(authState: Subject<AuthState>) {
  const _signOut = Amplify.Auth.signOut;
  Amplify.Auth.signOut = (): Promise<any> => {
    return _signOut.call(Amplify.Auth)
      .then(data => {
        logger.debug('signOut success');
        authState.next({ state: 'signedOut', user: null });
        return data;
      })
      .catch(err => {
        logger.debug('signOut error', err);
        throw err;
      });
  };
}

function decorateSignUp(authState: Subject<AuthState>) {
  const _signUp = Amplify.Auth.signUp;
  Amplify.Auth.signUp = (
    username: string,
    password: string,
    email: string,
    phone_number: string
  ): Promise<any> => {
    return _signUp.call(Amplify.Auth, username, password, email, phone_number)
      .then(data => {
        logger.debug('signUp success');
        authState.next({ state: 'confirmSignUp', user: { username }});
        return data;
      })
      .catch(err => {
        logger.debug('signUp error', err);
        throw err;
      });
  };
}

function decorateConfirmSignUp(authState: Subject<AuthState>) {
  const _confirmSignUp = Amplify.Auth.confirmSignUp;
  Amplify.Auth.confirmSignUp = (
    username: string,
    code: string
  ): Promise<any> => {
    return _confirmSignUp.call(Amplify.Auth, username, code)
      .then(data => {
        logger.debug('confirmSignUp success');
        authState.next({ state: 'signIn', user: { username }});
        return data;
      })
      .catch(err => {
        logger.debug('confirmSignUp error', err);
        throw err;
      });
  };
}

export function authDecorator(authState: Subject<AuthState>) {
  check(authState);
  listen(authState);

  decorateSignIn(authState);
  decorateSignOut(authState);
  decorateSignUp(authState);
  decorateConfirmSignUp(authState);
}
