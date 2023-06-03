export const Framework = {
	None: '0',
	ReactNative: '1',
};

export const authCategory = 'auth';

// Actions
export const AuthAction = {
	// Standard flow
	SignUp: '1',
	InitiateAuth: '2',
	ConfirmSignUp: '3',
	ResendConfirmationCode: '4',
	GetUser: '5',
	SetUserMFAPreference: '6',
	SetUserSettings: '7',
	AssociateSoftwareToken: '8',
	VerifySoftwareToken: '9',
	RespondToAuthChallenge: '10',
	DeleteUserAttributes: '11',
	DeleteUser: '12',
	UpdateUserAttributes: '13',
	GetUserAttributeVerificationCode: '14',
	VerifyUserAttribute: '15',
	GlobalSignOut: '16',
	RevokeToken: '17',
	ChangePassword: '18',
	ForgotPassword: '19',
	ConfirmForgotPassword: '20',
	ConfirmDevice: '21',
	UpdateDeviceStatus: '22',
	ForgetDevice: '23',
	ListDevices: '24',
	OAuthToken: '25',
};
