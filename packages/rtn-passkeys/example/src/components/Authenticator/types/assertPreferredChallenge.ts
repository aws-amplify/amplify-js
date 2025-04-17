import { SignInInput } from 'aws-amplify/auth';

export function assertPreferredChallenge(
	value: unknown
): value is NonNullable<
	NonNullable<SignInInput['options']>['preferredChallenge']
> {
	return (
		typeof value === 'string' &&
		['EMAIL_OTP', 'SMS_OTP', 'PASSWORD', 'PASSWORD_SRP', 'WEB_AUTHN'].includes(
			value
		)
	);
}
