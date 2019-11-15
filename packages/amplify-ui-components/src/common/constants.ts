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
export const FORGOT_PASSWORD_TEXT = 'Forgot your password?';
export const RESET_PASSWORD_TEXT = 'Reset password';
export const RESET_YOUR_PASSWORD = 'Reset your password';
export const PASSWORD_SUFFIX = 'password';
export const PASSWORD_LABEL = 'Password *';
export const PASSWORD_PLACEHOLDER = 'Enter your password';
export const BACK_TO_SIGN_IN = 'Back to Sign In';

// Country Dial Code common constants
export const COUNTRY_DIAL_CODE_SUFFIX = 'country-dial-code-select';
export const COUNTRY_DIAL_CODE_DEFAULT = '+1';

// Sign In common constants
// TODO: Change to SIGN_IN_HEADER_TEXT
export const HEADER_TEXT = 'Sign into your account';
// TODO: Change to SIGN_IN_SUBMIT_BUTTON_TEXT
export const SUBMIT_BUTTON_TEXT = 'Sign in';
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
export const SIGN_UP_SUBMIT_BUTTON_TEXT = 'Create account';
export const HAVE_ACCOUNT_TEXT = 'Have an account?';
export const SIGN_IN_TEXT = 'Sign in';
export const SIGN_UP_USERNAME_PLACEHOLDER = 'Create a username';
export const SIGN_UP_PASSWORD_PLACEHOLDER = 'Create a password';

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

// Error message Common Constants
export const PHONE_EMPTY_ERROR_MESSAGE = 'Phone number can not be empty';
export const NO_AUTH_MODULE_FOUND = 'No Auth module found, please ensure @aws-amplify/auth is imported';
