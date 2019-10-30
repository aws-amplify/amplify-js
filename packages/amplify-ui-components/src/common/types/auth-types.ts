export enum AuthState {
  SignUp = 'signup',
  SignOut = 'signout',
  SignIn = 'signin',
  Loading = 'loading',
  signedOut = 'signedout',
  SignedIn = 'signedin',
  SigningUp = 'signingup',
  ConfirmSignUp = 'confirmSignUp',
  confirmingSignUpCustomFlow = 'confirmsignupcustomflow',
  ConfirmSignIn = 'confirmSignIn',
  confirmingSignInCustomFlow = 'confirmingsignincustomflow',
  VerifyingAttributes = 'verifyingattributes',
  ForgotPassword = 'forgotpassword',
  ResetPassword = 'resettingpassword',
  SettingMFA = 'settingMFA',
  TOTPSetup = 'TOTPSetup',
  CustomConfirmSignIn = 'customConfirmSignIn',
  VerifyContact = 'verifycontact',
}

export interface CognitoUserInterface {
  codeDeliveryDetails?: {
    AttributeName?: string;
    DeliveryMedium?: string;
    Destination?: string;
  };
  user?: {
    Session?: string | null;
    authenticationFlowType?: string;
    client?: {
      endpoint?: string;
      userAgent?: string;
    };
    keyPrefix?: string;
    pool?: {
      advancedSecurityDataCollectionFlag?: boolean;
      clientId?: string;
      userPoolId?: string;
    };
    username?: string;
    userConfirmed?: boolean;
    userSub?: string;
  };
  username?: string;
}
