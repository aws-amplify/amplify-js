export interface AmplifyForgotPasswordHintProps {
  forgotPasswordText: string;
  resetPasswordText: string;
  authState?: string;
  onAuthStateChange?: any;
}

export interface AmplifySignInFormFooterProps {
  submitButtonText: string;
  noAccountText: string;
  createAccountText: string;
  overrideStyle?: boolean;
  authState?: string;
  onAuthStateChange?: any;
}