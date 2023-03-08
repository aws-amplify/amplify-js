import { AuthUserAttributeKey } from './AuthUserAttributeKey';

export type AuthUserAttribute<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	userAttributeKey: UserAttributeKey;
	value: string;
};
