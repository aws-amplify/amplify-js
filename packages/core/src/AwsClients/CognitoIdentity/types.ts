import { MetadataBearer as __MetadataBearer } from '@aws-sdk/types';

declare namespace GetCredentialsForIdentityInput {
	const filterSensitiveLog: (obj: GetCredentialsForIdentityInput) => any;
}
declare namespace GetCredentialsForIdentityResponse {
	const filterSensitiveLog: (obj: GetCredentialsForIdentityResponse) => any;
}
declare namespace GetIdInput {
	const filterSensitiveLog: (obj: GetIdInput) => any;
}
declare namespace GetIdResponse {
	const filterSensitiveLog: (obj: GetIdResponse) => any;
}
export declare namespace Credentials {
	const filterSensitiveLog: (obj: Credentials) => any;
}
export declare type GetCredentialsForIdentityCommandInput =
	GetCredentialsForIdentityInput;
export declare type GetCredentialsForIdentityCommandOutput =
	GetCredentialsForIdentityResponse & __MetadataBearer;
export declare type GetIdCommandInput = GetIdInput;
export declare type GetIdCommandOutput = GetIdResponse & __MetadataBearer;
/**
 * <p>Credentials for the provided identity ID.</p>
 */
export interface Credentials {
	/**
	 * <p>The Access Key portion of the credentials.</p>
	 */
	AccessKeyId?: string;
	/**
	 * <p>The Secret Access Key portion of the credentials</p>
	 */
	SecretKey?: string;
	/**
	 * <p>The Session Token portion of the credentials</p>
	 */
	SessionToken?: string;
	/**
	 * <p>The date at which these credentials will expire.</p>
	 */
	Expiration?: Date;
}
/**
 * <p>Input to the <code>GetCredentialsForIdentity</code> action.</p>
 */
export interface GetCredentialsForIdentityInput {
	/**
	 * <p>A unique identifier in the format REGION:GUID.</p>
	 */
	IdentityId: string | undefined;
	/**
	 * <p>A set of optional name-value pairs that map provider names to provider tokens. The
	 *          name-value pair will follow the syntax "provider_name":
	 *          "provider_user_identifier".</p>
	 *          <p>Logins should not be specified when trying to get credentials for an unauthenticated
	 *          identity.</p>
	 *          <p>The Logins parameter is required when using identities associated with external
	 *          identity providers such as FaceBook. For examples of <code>Logins</code> maps, see the code
	 *          examples in the <a href="http://docs.aws.amazon.com/cognito/latest/developerguide/external-identity-providers.html">External Identity Providers</a> section of the Amazon Cognito Developer
	 *          Guide.</p>
	 */
	Logins?: {
		[key: string]: string;
	};
	/**
	 * <p>The Amazon Resource Name (ARN) of the role to be assumed when multiple roles were
	 *          received in the token from the identity provider. For example, a SAML-based identity
	 *          provider. This parameter is optional for identity providers that do not support role
	 *          customization.</p>
	 */
	CustomRoleArn?: string;
}
/**
 * <p>Returned in response to a successful <code>GetCredentialsForIdentity</code>
 *          operation.</p>
 */
export interface GetCredentialsForIdentityResponse {
	/**
	 * <p>A unique identifier in the format REGION:GUID.</p>
	 */
	IdentityId?: string;
	/**
	 * <p>Credentials for the provided identity ID.</p>
	 */
	Credentials?: Credentials;
}
/**
 * <p>Input to the GetId action.</p>
 */
export interface GetIdInput {
	/**
	 * <p>A standard AWS account ID (9+ digits).</p>
	 */
	AccountId?: string;
	/**
	 * <p>An identity pool ID in the format REGION:GUID.</p>
	 */
	IdentityPoolId: string | undefined;
	/**
	 * <p>A set of optional name-value pairs that map provider names to provider tokens. The
	 *          available provider names for <code>Logins</code> are as follows:</p>
	 *          <ul>
	 *             <li>
	 *                <p>Facebook: <code>graph.facebook.com</code>
	 *                </p>
	 *             </li>
	 *             <li>
	 *                <p>Amazon Cognito user pool:
	 *                   <code>cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID></code>,
	 *                for example, <code>cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789</code>.
	 *             </p>
	 *             </li>
	 *             <li>
	 *                <p>Google: <code>accounts.google.com</code>
	 *                </p>
	 *             </li>
	 *             <li>
	 *                <p>Amazon: <code>www.amazon.com</code>
	 *                </p>
	 *             </li>
	 *             <li>
	 *                <p>Twitter: <code>api.twitter.com</code>
	 *                </p>
	 *             </li>
	 *             <li>
	 *                <p>Digits: <code>www.digits.com</code>
	 *                </p>
	 *             </li>
	 *          </ul>
	 */
	Logins?: {
		[key: string]: string;
	};
}
/**
 * <p>Returned in response to a GetId request.</p>
 */
export interface GetIdResponse {
	/**
	 * <p>A unique identifier in the format REGION:GUID.</p>
	 */
	IdentityId?: string;
}

export {};
