export enum AuthState {
  LoggedOut = 'LoggedOut',
  LoggedIn = 'LoggedIn',
}

export interface UserData {
  username?: string;
}

export interface Creds {
  username?: string;
  password?: string;
}
