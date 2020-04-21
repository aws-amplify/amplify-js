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
    email?: string | undefined;
    phone_number?: string | undefined;
    [userAttributes: string]: string;
  };
}
