import TEST_ID from '../../AmplifyTestIDs';

export default [
	{
		label: 'Username',
		key: 'username',
		required: true,
		placeholder: 'Username',
		displayOrder: 1,
		testID: TEST_ID.AUTH.USERNAME_INPUT,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
		testID: TEST_ID.AUTH.PASSWORD_INPUT,
	},
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 3,
		testID: TEST_ID.AUTH.EMAIL_INPUT,
	},
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 4,
		testID: TEST_ID.AUTH.PHONE_INPUT,
	},
];

export const signUpWithEmailFields = [
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 1,
		testID: TEST_ID.AUTH.EMAIL_INPUT,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
		testID: TEST_ID.AUTH.PASSWORD_INPUT,
	},
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 3,
		testID: TEST_ID.AUTH.PHONE_INPUT,
	},
];

export const signUpWithPhoneNumberFields = [
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 1,
		testID: TEST_ID.AUTH.PHONE_INPUT,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
		testID: TEST_ID.AUTH.PASSWORD_INPUT,
	},
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 3,
		testID: TEST_ID.AUTH.EMAIL_INPUT,
	},
];
