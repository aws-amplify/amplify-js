import { AuthUserAttributeKey } from '.';

export type AuthUserAttribute<UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey> = {
	userAttributeKey: UserAttributeKey;
	value: string;
};