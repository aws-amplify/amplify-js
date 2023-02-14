export type CancelSignIn = {
	type: 'CancelSignIn';
	payload: {};
};

export type ClearFederationToIdentityPool = {
	type: 'ClearFederationToIdentityPool';
	payload: {};
};

export type ClearedFederationToIdentityPool = {
	type: 'ClearedFederationToIdentityPool';
	payload: {};
};

export type Configure = {
	type: 'Configure';
	payload: {
		config: {
			region: string;
		};
	};
};

export type Error = {
	type: 'Error';
	payload: {};
};

export type InitializedSignIn = {
	type: 'InitializedSignIn';
	payload: {};
};

export type InitializedSignOut = {
	type: 'InitializedSignOut';
	payload: {};
};

export type ReceivedSessionError = {
	type: 'ReceivedSessionError';
	payload: {};
};

export type SessionEstablished = {
	type: 'SessionEstablished';
	payload: {};
};

export type SignedOut = {
	type: 'SignedOut';
	payload: {};
};

export type SignInRequested = {
	type: 'SignInRequested';
	payload: {
		username: string;
		password: string;
	};
};

export type SignOutRequested = {
	type: 'SignOutRequested';
	payload: {};
};

export type StartFederationToIdentityPool = {
	type: 'StartFederationToIdentityPool';
	payload: {};
};

export type AuthenticationStateEvents =
	| CancelSignIn
	| ClearFederationToIdentityPool
	| ClearedFederationToIdentityPool
	| Configure
	| Error
	| InitializedSignIn
	| InitializedSignOut
	| ReceivedSessionError
	| SessionEstablished
	| SignedOut
	| SignInRequested
	| SignOutRequested
	| StartFederationToIdentityPool;
