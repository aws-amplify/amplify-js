import { SignInInput } from 'aws-amplify/auth';

export function assertAuthFlowType(
	value: unknown
): value is NonNullable<NonNullable<SignInInput['options']>['authFlowType']> {
	return (
		typeof value === 'string' &&
		[
			'USER_AUTH',
			'USER_SRP_AUTH',
			'CUSTOM_WITH_SRP',
			'CUSTOM_WITHOUT_SRP',
			'USER_PASSWORD_AUTH',
		].includes(value)
	);
}
