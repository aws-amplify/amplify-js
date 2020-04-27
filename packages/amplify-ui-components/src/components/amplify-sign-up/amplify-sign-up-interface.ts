export interface AmplifySignUpFormFooterProps {
  submitButtonText: string;
  haveAcccountText: string;
  signInText: string;
  handleAuthStateChange?: any;
}

export interface AmplifySignUpAttributes {
  username: string;
  password: string;
  attributes?: {
    [userAttributes: string]: string;
  };
}
