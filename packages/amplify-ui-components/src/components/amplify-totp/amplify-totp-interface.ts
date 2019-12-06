export enum MfaMethod {
  TOTP = 'TOTP',
  SMS = 'SMS',
  NOMFA = 'NOMFA',
}

export type TOTPSetupEventType = 'SETUP_TOTP';
