import { AuthUserAttribute } from '../models/AuthUserAttribute';
import { AuthUserAttributeKey } from '../models/AuthUserAttributeKey';
import { AuthServiceOptions } from './AuthServiceOptions';

export type AuthSignUpOptions<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	userAttributes: AuthUserAttribute<UserAttributeKey>[];
	serviceOptions?: ServiceOptions;
};
