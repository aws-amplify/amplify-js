export const Framework = {
	None: '0',
	ReactNative: '1',
};

export const authCategory = 'auth';

// Actions
/* TODO: Replace 'None' with all expected Actions */
export const AuthAction = {
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
	UpdateDeviceStatus: '21',
	ForgetDevice: '22',
	ListDevices: '23',
};
