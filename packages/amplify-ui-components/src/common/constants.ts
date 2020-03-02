// Dictionaries

// fieldId constants
export const USERNAME_SUFFIX = 'username';
export const EMAIL_SUFFIX = 'email';
export const CODE_SUFFIX = 'code';
export const PHONE_SUFFIX = 'phone';
export const PASSWORD_SUFFIX = 'password';

// Country Dial Code common constants
export const COUNTRY_DIAL_CODE_SUFFIX = 'country-dial-code-select';
export const COUNTRY_DIAL_CODE_DEFAULT = '+1';

// Auth Keys
export const AUTH_SOURCE_KEY = 'amplify-auth-source';
export const SIGNING_IN_WITH_HOSTEDUI_KEY = 'amplify-signin-with-hostedUI';
export const AUTHENTICATOR_AUTHSTATE = 'amplify-authenticator-authState';

// Error message Common Constants
export const PHONE_EMPTY_ERROR_MESSAGE = 'Phone number can not be empty';
export const NO_AUTH_MODULE_FOUND = 'No Auth module found, please ensure @aws-amplify/auth is imported';

// TOTP Messages
export const SETUP_TOTP = 'SETUP_TOTP';

// Select MFA Types Messages
export const USER_NOT_SETUP_SOFTWARE_TOKEN_MFA = 'User has not set up software token mfa';
export const USER_NOT_VERIFIED_SOFTWARE_TOKEN_MFA = 'User has not verified software token mfa';

// Common events
export const SUCCESS = 'SUCCESS';
export const FAILURE = 'FAILURE';

// Hub Events and Channels
export const UI_AUTH_CHANNEL = 'UI Auth';
export const TOAST_AUTH_ERROR_EVENT = 'ToastAuthError';
export const AUTH_STATE_CHANGE_EVENT = 'AuthStateChange';
