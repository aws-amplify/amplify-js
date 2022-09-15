export type CognitoCompletePasswordOptions = {
	username: string;
	newPassword: string;
	requiredAttributes?: { [key: string]: any };
	session: string;
};
