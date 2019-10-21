export interface AmplifyConfirmSignUpHintProps {
  forgotCodeText: string;
  resendCodeText: string;
  resendConfirmCode?: Function;
}

export interface AmplifyConfirmSignUpFormFooterProps {
  submitButtonText: string;
  signInText: string;
  overrideStyle?: boolean;
  onAuthStateChange?: any;
}
