export enum AuthErrorStrings {
	DEFAULT_MSG = 'Authentication Error',
	EMPTY_EMAIL = 'Email cannot be empty',
	EMPTY_PHONE = 'Phone number cannot be empty',
	EMPTY_USERNAME = 'Username cannot be empty',
	INVALID_USERNAME = 'The username should either be a string or one of the sign in types',
	EMPTY_PASSWORD = 'Password cannot be empty',
	EMPTY_CODE = 'Confirmation code cannot be empty',
	SIGN_UP_ERROR = 'Error creating account',
	NO_MFA = 'No valid MFA method provided',
	INVALID_MFA = 'Invalid MFA type',
	EMPTY_CHALLENGE = 'Challenge response cannot be empty',
	NO_USER_SESSION = 'Failed to get the session because the user is empty',
	NETWORK_ERROR = 'Network Error',
	DEVICE_CONFIG = 'Device tracking has not been configured in this User Pool',
	
	/**
   * **The user is attempting to sign-up with an email already configured in the User Pool.**
   */
	EMAIL_ALREADY_EXISTS = 'An account with the given email already exists.',
	
	/**
   * **The user session is invalid and are required to sign-in again.**
	 * 
	 * Error encountered in following scenarios:
	 * - User attempts sign-in and does not respond to MFA challenge quick enough via `confirmSignIn`
   */
	INVALID_SESSION = 'Invalid session for the user, session is expired.',
	
	/**
   * **The user provided an invalid code when responding to MFA challenge.**
	 * 
	 * Error encountered in following scenarios:
	 * - User attempts sign-in and provides incorrect code to `confirmSignIn`
   */
	INVALID_MFA_CODE = 'Invalid code received for user',
	
	/**
   * **The user provided an invalid code when responding to an email confirmation.**
	 * 
	 * Error encountered in following scenarios:
	 * - User attempts confirm sign-up and provides incorrect code to `confirmSignUp`
   */
	INVALID_EMAIL_CONFIRMATION_CODE = 'Invalid code provided, please request a code again.',
	
	/**
   * **The user attempts to confirm their email a second time, when it's already confirmed.**
   */
	USER_EMAIL_IS_ALREADY_CONFIRMED = 'User cannot be confirmed. Current status is CONFIRMED'
}
