import { AuthUserAttributeKey } from '../models/AuthUserAttributeKey';
import { AuthServiceOptions } from '../options/AuthServiceOptions';
import { AuthSignUpOptions } from '../options/AuthSignUpOptions';

export type SignUpRequest<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	password: string;
	userId?: string;
	options?: AuthSignUpOptions<UserAttributeKey, ServiceOptions>;
};
