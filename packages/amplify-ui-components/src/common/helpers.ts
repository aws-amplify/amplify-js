import { cx } from 'emotion';
import { Hub } from '@aws-amplify/core';
import { TOAST_AUTH_ERROR_CHANNEL, TOAST_AUTH_ERROR_EVENT } from './constants';

interface Error {
  code: string;
  name: string;
  message: string;
}
// TODO: rename
export const styleNuker = (override: boolean, cn: string, ecn: string): string => (override ? cn : cx(ecn, cn));

export const styleBranch = (branch: boolean, baseClass: string, branchClassA: string, branchClassB: string): string =>
  branch ? cx(baseClass, branchClassA) : cx(baseClass, branchClassB);

export const dispatchToastHubEvent = (error: Error) => {
  Hub.dispatch(TOAST_AUTH_ERROR_CHANNEL, {
    event: TOAST_AUTH_ERROR_EVENT,
    message: error.message,
  });
};
