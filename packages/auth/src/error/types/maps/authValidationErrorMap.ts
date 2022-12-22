import { AuthValidationErrorCode } from '../code/authValidationErrorCode';

export type AuthValidationErrorMap = {
	[AuthValidationErrorCode.EmptyChallengeResponse]: {
		message: 'challengeResponse is required to confirmSignIn';
		recovery: 'Make sure that a valid challenge response is passed for confirmSignIn';
	};
	[AuthValidationErrorCode.EmptyConfirmResetPasswordUsername]: {
		message: 'username is required to confirmResetPassword';
		recovery: 'Make sure that a valid username is passed for confirmResetPassword';
	};
	[AuthValidationErrorCode.EmptyConfirmSignUpCode]: {
		message: 'code is required to confirmSignUp';
		recovery: 'Make sure that a valid code is passed for confirmSignUp';
	};
	[AuthValidationErrorCode.EmptyConfirmSignUpUsername]: {
		message: 'Username is required to confirmSignUp';
		recovery: 'Make sure that a valid username is passed for confirmSignUp';
	};
	[AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode]: {
		message: 'confirmationCode is required to confirmResetPassword';
		recovery: 'Make sure that a valid confirmationCode is passed for confirmResetPassword';
	};
	[AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword]: {
		message: 'newPassword is required to confirmResetPassword';
		recovery: 'Make sure that a valid newPassword is passed for confirmResetPassword';
	};
	[AuthValidationErrorCode.EmptyResendSignUpCodeUsername]: {
		message: 'Username is required to confirmSignUp';
		recovery: 'Make sure that a valid username is passed for confirmSignUp';
	};
	[AuthValidationErrorCode.EmptyResetPasswordUsername]: {
		message: 'username is required to resetPassword';
		recovery: 'Make sure that a valid username is passed for resetPassword';
	};
	[AuthValidationErrorCode.EmptySignInPassword]: {
		message: 'Password is required to signIn';
		recovery: 'Make sure that a valid password is passed during sigIn';
	};
	[AuthValidationErrorCode.EmptySignInUsername]: {
		message: 'Username is required to signIn';
		recovery: 'Make sure that a valid username is passed during sigIn';
	};
	[AuthValidationErrorCode.EmptySignUpPassword]: {
		message: 'Password is required to signUp';
		recovery: 'Make sure that a valid password is passed for signUp';
	};
	[AuthValidationErrorCode.EmptySignUpUsername]: {
		message: 'Username is required to signUp';
		recovery: 'Make sure that a valid username is passed for signUp';
	};

	[AuthValidationErrorCode.EmptyMFA]: {
		message: 'An MFA type is required to setPreferredMFA';
		recovery: 'Make sure that an MFA type valid username is passed for signUp';
	};
};
