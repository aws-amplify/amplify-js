import { CognitoUserInterface } from '../../common/types/auth-types';

export interface TOTPInterface {
  authData?: CognitoUserInterface;
  onTOTPEvent?: (event: any, data: any, user: any) => void;
  theme?: any;
}

export interface TOTPInterfaceState {
  code: string | null;
  setupMessage: string | null;
}
