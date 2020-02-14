import { Hub } from '@aws-amplify/core';
import { UI_AUTH_CHANNEL, TOAST_AUTH_ERROR_EVENT, AUTH_STATE_CHANGE_EVENT } from './constants';
import { AuthState, AuthStateHandler } from '../common/types/auth-types';

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
    data
  });
};