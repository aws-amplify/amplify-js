export type AuthPluginOptions = Record<string, any>;

export type AuthUserAttributeKey = string;

export type AuthUserAttribute<AuthUserAttributeKey> = {
	userAttributeKey: AuthUserAttributeKey;
	value: string;
};

export type AuthUserAttributes = {
	[key:string]: string
};

export type AuthProvider = 
	'GOOGLE' | 
	'FACEBOOK'|
 	'AMAZON' | 
	'COGNITO' | 
	`custom${string}` |
	`oidc${string}` |
	`saml${string}`;