import { Auth } from '@aws-amplify/auth';
import { isEmpty } from '@aws-amplify/core';
import { NO_AUTH_MODULE_FOUND } from '../common/constants';
import { AuthState, CognitoUserInterface } from './types/auth-types';
import { dispatchToastHubEvent } from './helpers';

export async function checkContact(user: CognitoUserInterface) {
  if (!Auth || typeof Auth.verifiedContact !== 'function') {
    throw new Error(NO_AUTH_MODULE_FOUND);
  }
  try {
    const dataVerifed = await Auth.verifiedContact(user);
    if (!isEmpty(dataVerifed)) {
      this.handleAuthStateChange(AuthState.SignedIn, user);
    } else {
      const newUser = Object.assign(user, dataVerifed);
      this.handleAuthStateChange(AuthState.VerifyContact, newUser);
    }
  } catch (error) {
    dispatchToastHubEvent(error);
  }
}
