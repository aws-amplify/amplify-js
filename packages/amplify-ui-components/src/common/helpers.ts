import { cx } from 'emotion';
import { Hub } from '@aws-amplify/core';
import { UI_AUTH_CHANNEL, TOAST_AUTH_ERROR_EVENT } from './constants';
import { AuthState } from '../common/types/auth-types';

interface ToastError {
  code: string;
  name: string;
  message: string;
}
// TODO: rename
export const styleNuker = (override: boolean, cn: string, ecn: string): string => (override ? cn : cx(ecn, cn));

export const styleBranch = (branch: boolean, baseClass: string, branchClassA: string, branchClassB: string): string =>
  branch ? cx(baseClass, branchClassA) : cx(baseClass, branchClassB);

export const dispatchToastHubEvent = (error: ToastError) => {
  Hub.dispatch(UI_AUTH_CHANNEL, {
    event: TOAST_AUTH_ERROR_EVENT,
    message: error.message,
  });
};

export const dispatchAuthStateChangeEvent = (nextAuthState: AuthState, data?: object) => {
  Hub.dispatch(UI_AUTH_CHANNEL, { event: nextAuthState, data });
};