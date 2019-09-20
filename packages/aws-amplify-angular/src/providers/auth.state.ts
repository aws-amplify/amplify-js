export interface AuthState {
	state: string; // signedOut, signedIn, mfaRequired, newPasswordRequired
	user: any;
}
