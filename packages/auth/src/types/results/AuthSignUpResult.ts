import { AuthNextSignUpStep } from '../models/AuthNextSignUpStep';
import { AuthUserAttributeKey } from '../models/AuthUserAttributeKey';

export type AuthSignUpResult<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	isSignUpComplete: boolean;
	nextStep: AuthNextSignUpStep<UserAttributeKey>;
};
