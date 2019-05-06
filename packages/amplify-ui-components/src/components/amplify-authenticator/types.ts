export enum AuthState {
  LoggedOut = 'LoggedOut',
  LoggedIn = 'LoggedIn',
}

export type UserData = {
  username?: string;
};

export type Creds = {
  username?: string;
  password?: string;
};
