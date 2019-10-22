export interface AmplifySignUpFormFooterProps {
  submitButtonText: string;
  haveAcccountText: string;
  signInText: string;
  overrideStyle?: boolean;
  handleAuthStateChange?: any;
}

export interface AmplifySignUpAttributes {
  username: string;
  password: string;
  attributes?: {
    email?: string;
    phone_number?: string;
  };
}
