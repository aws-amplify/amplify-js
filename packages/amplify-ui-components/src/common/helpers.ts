import { Hub } from '@aws-amplify/core';
import {
  UI_AUTH_CHANNEL,
  TOAST_AUTH_ERROR_EVENT,
  AUTH_STATE_CHANGE_EVENT,
  PHONE_EMPTY_ERROR_MESSAGE,
} from './constants';
import { AuthState, AuthStateHandler, UsernameAlias } from '../common/types/auth-types';
import { PhoneNumberInterface } from '../components/amplify-auth-fields/amplify-auth-fields-interface';

interface ToastError {
  code: string;
  name: string;
  message: string;
}

export const hasShadowDom = (el: HTMLElement) => {
  return !!el.shadowRoot && !!(el as any).attachShadow;
};

export const dispatchToastHubEvent = (error: ToastError) => {
  Hub.dispatch(UI_AUTH_CHANNEL, {
    event: TOAST_AUTH_ERROR_EVENT,
    message: error.message,
  });
};

export const dispatchAuthStateChangeEvent: AuthStateHandler = (nextAuthState: AuthState, data?: object) => {
  Hub.dispatch(UI_AUTH_CHANNEL, {
    event: AUTH_STATE_CHANGE_EVENT,
    message: nextAuthState,
    data,
  });
};

export const composePhoneNumberInput = (phoneNumber: PhoneNumberInterface) => {
  if (!phoneNumber.phoneNumberValue) {
    throw new Error(PHONE_EMPTY_ERROR_MESSAGE);
  }

  const sanitizedPhoneNumberValue = phoneNumber.phoneNumberValue.replace(/[-()\s]/g, '');

  return `${phoneNumber.countryDialCodeValue}${sanitizedPhoneNumberValue}`;
};

export const checkUsernameAlias = (usernameAlias: any) => {
  if (!(usernameAlias in UsernameAlias)) {
    throw new Error(`Invalid username Alias - ${usernameAlias}. Instead use ${Object.values(UsernameAlias)}`);
  }
};
