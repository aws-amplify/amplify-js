export interface AmplifyForgotPasswordHintProps {
	forgotPasswordText: string;
	resetPasswordText: string;
	onAuthStateChange?: any;
}

export interface AmplifySignInFormFooterProps {
	submitButtonText: string;
	noAccountText: string;
	createAccountText: string;
	onAuthStateChange?: any;
}

export interface SignInAttributes {
	userInput: string;
	password: string;
}
