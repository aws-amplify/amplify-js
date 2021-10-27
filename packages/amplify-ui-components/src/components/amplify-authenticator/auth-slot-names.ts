import { AuthState } from '../../common/types/auth-types';

export const authSlotNames: Partial<Record<AuthState, string>> = {
	[AuthState.SignIn]: 'sign-in',
	[AuthState.ConfirmSignIn]: 'confirm-sign-in',
	[AuthState.SignUp]: 'sign-up',
	[AuthState.ConfirmSignUp]: 'confirm-sign-up',
	[AuthState.ForgotPassword]: 'forgot-password',
	[AuthState.ResetPassword]: 'require-new-password',
	[AuthState.VerifyContact]: 'verify-contact',
	[AuthState.TOTPSetup]: 'totp-setup',
	[AuthState.Loading]: 'loading',
};
