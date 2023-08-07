import { AmplifyError } from '../../Errors';
import { AmplifyV6 } from '../../singleton';
import { decodeJWT } from '../../singleton/Auth/utils';

type NewDeviceMetadataType = {
	DeviceKey?: string;

	DeviceGroupKey?: string;
};
type AuthenticationResultType = {
	AccessToken?: string;

	ExpiresIn?: number;

	TokenType?: string;

	RefreshToken?: string;

	IdToken?: string;

	NewDeviceMetadata?: NewDeviceMetadataType;
};

export async function cacheCognitoTokens(
	AuthenticationResult: AuthenticationResultType
): Promise<void> {
	if (AuthenticationResult.AccessToken) {
		const accessToken = decodeJWT(AuthenticationResult.AccessToken || '');
		const accessTokenExpAtInMillis = (accessToken.payload.exp || 0) * 1000;
		const accessTokenIssuedAtInMillis = (accessToken.payload.iat || 0) * 1000;
		const currentTime = new Date().getTime();
		const clockDrift =
			accessTokenIssuedAtInMillis > 0
				? accessTokenIssuedAtInMillis - currentTime
				: 0;
		let idToken;
		const metadata: Record<string, string> = {};

		if (AuthenticationResult.RefreshToken) {
			metadata.refreshToken = AuthenticationResult.RefreshToken;
		}
		if (AuthenticationResult.NewDeviceMetadata) {
			metadata.NewDeviceMetadata = JSON.stringify(
				AuthenticationResult.NewDeviceMetadata
			); // TODO: Needs to parse to get metadata
		}
		if (AuthenticationResult.IdToken) {
			idToken = decodeJWT(AuthenticationResult.IdToken);
		}

		AmplifyV6.Auth.setTokens({
			accessToken,
			accessTokenExpAt: accessTokenExpAtInMillis,
			idToken,
			metadata,
			clockDrift,
		});
	} else {
		// This would be a service error
		throw new AmplifyError({
			message: 'Invalid tokens',
			name: 'InvalidTokens',
			recoverySuggestion: 'Check Cognito UserPool settings',
		});
	}
}
