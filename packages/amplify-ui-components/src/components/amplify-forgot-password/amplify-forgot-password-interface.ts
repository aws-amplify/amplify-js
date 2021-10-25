export type CodeDeliveryType = 'SMS' | 'EMAIL';

export interface ForgotPasswordAttributes {
	userInput: string;
	password: string;
	code: string;
}
