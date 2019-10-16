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
  ResetPassword = 'resettingpassword',
  settingMFA = 'settingMFA',
}

// export const authenticatorMapping = {
//   'signup': AuthState.SignUp,
//   'signin': AuthState.SignIn,
//   'signout': AuthState.SignOut,
//   '': AuthState.Loading,
//   'loading': AuthState.Loading,
//   'forgotpassword': AuthState.ForgotPassword,
// };

export type AuthStateType =
  | 'signup'
  | 'signout'
  | 'signIn'
  | 'loading'
  | 'signedout'
  | 'signedin'
  | 'signingup'
  | 'confirmSignup'
  | 'confirmsignupcustomflow'
  | 'confirmingsignin'
  | 'confirmingsignincustomflow'
  | 'verifyingattributes'
  | 'forgotpassword'
  | 'resettingPassword'
  | 'settingMFA';
