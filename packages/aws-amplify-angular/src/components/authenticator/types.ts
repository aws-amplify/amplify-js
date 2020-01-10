export enum UsernameAttributes {
	EMAIL = 'email',
	PHONE_NUMBER = 'phone_number',
	USERNAME = 'username',
}

export type UsernameFieldOutput = {
	username?: string;
	email?: string;
	country_code?: string;
	local_phone_number?: string;
};

export type PhoneFieldOutput = {
	country_code: string;
	local_phone_number: string;
};
