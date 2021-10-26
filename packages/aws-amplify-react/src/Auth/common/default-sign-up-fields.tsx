export interface ISignUpField {
	label: string;
	key: string;
	placeholder: string;
	required: boolean;
	displayOrder: number;
	invalid?: boolean;
	custom?: boolean;
	type?: string;
}

export const signUpWithUsernameFields = [
	{
		label: 'Username',
		key: 'username',
		required: true,
		placeholder: 'Username',
		displayOrder: 1,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
	},
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 3,
	},
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 4,
	},
];

export const signUpWithEmailFields: ISignUpField[] = [
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 1,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
	},
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 3,
	},
];

export const signUpWithPhoneNumberFields: ISignUpField[] = [
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 1,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
	},
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 3,
	},
];
