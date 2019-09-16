// Namespace
const AMPLIFY_UI_PREFIX = 'amplify-ui';

// Classnames
export const AMPLIFY_UI_TEXT_INPUT = `${AMPLIFY_UI_PREFIX}-text-input`;
export const AMPLIFY_UI_SCENE = `${AMPLIFY_UI_PREFIX}-scene`;
export const AMPLIFY_UI_SCENE_LOADING = `${AMPLIFY_UI_PREFIX}-scene-loading`;

// Dictionaries

/* 
  The below constants will be moved to an i18n solution.
  Storing here to have a common place to pull from once we pick up that work.
*/
const COMMON_USERNAME_TEXT = {
  USERNAME_SUFFIX: 'username',
  USERNAME_LABEL: 'Username *',
  USERNAME_PLACEHOLDER: 'Enter your username',
};

const COMMON_PASSWORD_TEXT = {
  PASSWORD_SUFFIX: 'password',
  PASSWORD_LABEL: 'Password *',
  PASSWORD_PLACEHOLDER: 'Enter your password'
};

const SIGN_IN_TEXT = {
  HEADER_TEXT: 'Sign into your account',
  FORGOT_PASSWORD_TEXT: 'Forgot your password?',
  RESET_PASSWORD_TEXT: 'Reset password',
  SUBMIT_BUTTON_TEXT: 'Sign in',
  CREATE_ACCOUNT_TEXT: 'Create account',
  NO_ACCOUNT_TEXT: 'No account?',
};

export {
  AMPLIFY_UI_PREFIX,
  COMMON_PASSWORD_TEXT,
  COMMON_USERNAME_TEXT,
  SIGN_IN_TEXT
};