// Namespace
export const AMPLIFY_UI_PREFIX = 'amplify-ui';

// Classnames
export const AMPLIFY_UI_TEXT_INPUT = `${AMPLIFY_UI_PREFIX}-text-input`;
export const AMPLIFY_UI_SCENE = `${AMPLIFY_UI_PREFIX}-scene`;
export const AMPLIFY_UI_SCENE_LOADING = `${AMPLIFY_UI_PREFIX}-scene-loading`;

// Dictionaries

/*
  The below constants will be moved to an i18n solution.
  Storing here to have a common place to pull from once we pick up that work.
*/
// Username common constants
export const USERNAME_SUFFIX = 'username';
export const USERNAME_LABEL = 'Username *';
export const USERNAME_PLACEHOLDER = 'Enter your username';

// Email common constants
export const EMAIL_SUFFIX = 'email';
export const EMAIL_LABEL = 'Email Address *';
export const EMAIL_PLACEHOLDER = 'amplify@example.com';

// Code common constants
export const CODE_SUFFIX = 'code';
export const CODE_LABEL = 'Verification code';
export const CODE_PLACEHOLDER = 'Enter code';
export const SEND_CODE = 'Send Code';
export const CONFIRM = 'Confirm';

// Phone common constants
export const PHONE_SUFFIX = 'phone';
export const PHONE_LABEL = 'Phone Number *';
export const PHONE_PLACEHOLDER = '(555) 555-1212';

// Password common constants
export const CHANGE_PASSWORD = 'Change Password';
export const CHANGE_PASSWORD_ACTION = 'Change';
export const FORGOT_PASSWORD_TEXT = 'Forgot your password?';
export const RESET_PASSWORD_TEXT = 'Reset password';
export const RESET_YOUR_PASSWORD = 'Reset your password';
export const PASSWORD_SUFFIX = 'password';
export const PASSWORD_LABEL = 'Password *';
export const PASSWORD_PLACEHOLDER = 'Enter your password';
export const NEW_PASSWORD_LABEL = 'New password';
export const NEW_PASSWORD_PLACEHOLDER = 'Enter your new password';

export const BACK_TO_SIGN_IN = 'Back to Sign In';

// Country Dial Code common constants
export const COUNTRY_DIAL_CODE_SUFFIX = 'country-dial-code-select';
export const COUNTRY_DIAL_CODE_DEFAULT = '+1';

// Sign In common constants
// TODO: Change to SIGN_IN_HEADER_TEXT
export const HEADER_TEXT = 'Sign in to your account';
// TODO: Change to SIGN_IN_SUBMIT_BUTTON_TEXT
export const SIGN_IN_SUBMIT_BUTTON_TEXT = 'Sign In';
export const CREATE_ACCOUNT_TEXT = 'Create account';
export const NO_ACCOUNT_TEXT = 'No account?';
export const CONFIRM_SMS_CODE = 'Confirm SMS Code';
export const CONFIRM_TOTP_CODE = 'Confirm TOTP Code';
export const SIGN_IN_WITH_AMAZON = 'Sign In with Amazon';
export const SIGN_IN_WITH_AUTH0 = 'Sign In with Auth0';
export const SIGN_IN_WITH_FACEBOOK = 'Sign In with Facebook';
export const SIGN_IN_WITH_GOOGLE = 'Sign In with Google';
export const SIGN_IN_WITH_AWS = 'Sign in with AWS';

// Sign Up common constants
export const SIGN_UP_HEADER_TEXT = 'Create a new account';
export const SIGN_UP_SUBMIT_BUTTON_TEXT = 'Create Account';
export const HAVE_ACCOUNT_TEXT = 'Have an account?';
export const SIGN_IN_TEXT = 'Sign in';
export const SIGN_UP_USERNAME_PLACEHOLDER = 'Username';
export const SIGN_UP_PASSWORD_PLACEHOLDER = 'Password';
export const SIGN_UP_EMAIL_PLACEHOLDER = 'Email';

// Confirm Sign Up common constants
export const CONFIRM_SIGN_UP_HEADER_TEXT = 'Confirm Sign up';
export const CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT = 'Confirm';
export const CONFIRM_SIGN_UP_CODE_LABEL = 'Confirmation Code';
export const CONFIRM_SIGN_UP_CODE_PLACEHOLDER = 'Enter your code';
export const CONFIRM_SIGN_UP_LOST_CODE = 'Lost your code?';
export const CONFIRM_SIGN_UP_RESEND_CODE = 'Resend Code';

// Sign Out
export const SIGN_OUT = 'Sign Out';

// Auth Keys
export const AUTH_SOURCE_KEY = 'amplify-auth-source';
export const SIGNING_IN_WITH_HOSTEDUI_KEY = 'amplify-signin-with-hostedUI';
export const AUTHENTICATOR_AUTHSTATE = 'amplify-authenticator-authState';

// Error message Common Constants
export const PHONE_EMPTY_ERROR_MESSAGE = 'Phone number can not be empty';
export const NO_AUTH_MODULE_FOUND = 'No Auth module found, please ensure @aws-amplify/auth is imported';

// TOTP
export const TOTP_HEADER_TEXT = 'Scan then enter verification code';
export const TOTP_SUBMIT_BUTTON_TEXT = 'Verify Security Token';
export const ALT_QR_CODE = 'qrcode';
export const TOTP_LABEL = 'Enter Security Code:';

// TOTP Messages
export const TOTP_SETUP_FAILURE = 'TOTP Setup has failed';
export const NO_TOTP_CODE_PROVIDED = 'No TOTP Code provided';
export const TOTP_SUCCESS_MESSAGE = 'Setup TOTP successfully!';
export const SETUP_TOTP = 'SETUP_TOTP';
export const SETUP_TOTP_REQUIRED = 'TOTP needs to be configured';

// Select MFA Types
export const SELECT_MFA_TYPE_SUBMIT_BUTTON_TEXT = 'Verify';
export const SELECT_MFA_TYPE_HEADER_TEXT = 'Select MFA Type';
export const MFA_TYPE_VALUES = 'MFA Type Values';

// Select MFA Types Messages
export const SET_PREFERRED_MFA_FAILURE = 'Set Preferred MFA failed';
export const SET_PREFERRED_MFA_SUCCESS = 'Set Preferred MFA Succeeded';
export const USER_NOT_SETUP_SOFTWARE_TOKEN_MFA = 'User has not set up software token mfa';
export const USER_NOT_VERIFIED_SOFTWARE_TOKEN_MFA = 'User has not verified software token mfa';
export const UNABLE_TO_SETUP_MFA_AT_THIS_TIME = 'Failed! Unable to configure MFA at this time';
export const SUCCESS_MFA_TYPE = 'Success! Your MFA Type is now:';
export const LESS_THAN_TWO_MFA_VALUES_MESSAGE = 'Less than two mfa types available';

// Verify Contact
export const VERIFY_CONTACT_HEADER_TEXT = 'Account recovery requires verified contact information';
export const VERIFY_CONTACT_SUBMIT_LABEL = 'Submit';
export const VERIFY_CONTACT_VERIFY_LABEL = 'Verify';
export const VERIFY_CONTACT_EMAIL_LABEL = 'Email';
export const VERIFY_CONTACT_PHONE_LABEL = 'Phone Number';

// Common events
export const SUCCESS = 'SUCCESS';
export const FAILURE = 'FAILURE';
