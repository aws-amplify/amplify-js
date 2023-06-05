export type CredentialsForIdentityIdClientInput = { identityId: string };

export type CredentialsForIdentityIdClientOutput = {
	credentials: AWSCognitoCredentials;
};

export type AWSCognitoCredentials = {
	accessKeyId: string;
	sessionToken: string;
	secretAccessKey: string;
	expiration: number;
	identityId?: string;
	authenticated?: boolean;
};

export async function credentialsForIdentityIdClient(
	params: CredentialsForIdentityIdClientInput
): Promise<CredentialsForIdentityIdClientOutput> {
	throw new Error('Function not complete.');
}
