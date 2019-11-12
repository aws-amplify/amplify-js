// TODO: Move these values to or extract them from the Cognito Provider in the Auth category for Auth V2

export enum AuthState {
  SignUp = 'signup',
  SignOut = 'signout',
  SignIn = 'signin',
  Loading = 'loading',
  SignedOut = 'signedout',
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

export interface FederatedConfig {
  auth0Config?: {
    clientID: string;
    domain: string;
    [key: string]: any;
  };
  amazonClientId?: string;
  facebookAppId?: string;
  googleClientId?: string;
  oauthConfig?: {
    [key: string]: any;
  };
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

export enum MfaOption {
  TOTP = 'TOTP',
  SMS = 'SMS',
  NOMFA = 'NOMFA',
}

export enum ChallengeName {
  SoftwareTokenMFA = 'SOFTWARE_TOKEN_MFA',
  SMSMFA = 'SMS_MFA',
  NewPasswordRequired = 'NEW_PASSWORD_REQUIRED',
  MFASetup = 'MFA_SETUP',
  CustomChallenge = 'CUSTOM_CHALLENGE',
}
