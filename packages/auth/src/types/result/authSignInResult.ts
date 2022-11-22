import { AuthNextSignInStep, AuthUserAttributeKey } from '../models';

export type AuthSignInResult<UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey> = {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
}