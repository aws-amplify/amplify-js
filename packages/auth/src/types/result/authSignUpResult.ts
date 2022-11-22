import { AuthNextSignUpStep, AuthUserAttributeKey } from '../models';

export type AuthSignUpResult<UserAttributeKey extends AuthUserAttributeKey> = {
	isSignUpComplete: boolean;
	nextStep: AuthNextSignUpStep<UserAttributeKey>
}