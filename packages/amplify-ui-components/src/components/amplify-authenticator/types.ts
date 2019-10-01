
export enum AuthState {
  SignUp = 'signup',
  SignOut = 'signout',
  SignIn = 'signin',
  Loading = 'loading',
  signedOut = 'signedout',
  signedIn = 'signedin',
  signingUp = 'signingup',
  confirmingSignUp = 'confirmsignup',
  confirmingSignUpCustomFlow = 'confirmsignupcustomflow',
  confirmingSignIn = 'confirmingsignin',
  confirmingSignInCustomFlow = 'confirmingsignincustomflow',
  verifyingAttributes = 'verifyingattributes',
  ForgotPassword = 'forgotpassword',
  resettingPassword = 'resettingpassword',
  settingMFA = 'settingMFA'
}

export interface UserData {
  username?: string;
}

export interface Creds {
  username?: string;
  password?: string;
}
