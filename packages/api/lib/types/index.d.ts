import { DocumentNode } from 'graphql/language/ast';
/**
 * RestClient instance options
 */
export declare class RestClientOptions {
	/** AWS credentials */
	credentials: AWSCredentials;
	/**
	 * Lookup key of AWS credentials.
	 * If credentials not provided then lookup from sessionStorage.
	 * Default 'awsCredentials'
	 */
	credentials_key: string;
	/** Additional headers for all requests send by this client. e.g. user-agent */
	headers: object;
	constructor();
}
/**
 * AWS credentials needed for RestClient
 */
export declare class AWSCredentials {
	/**
	 * Secret Access Key
	 *
	 * [Access Key ID and Secret Access Key]
	 * (http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
	 */
	secretAccessKey: string;
	/**
	 * Access Key ID
	 *
	 * [Access Key ID and Secret Access Key]
	 * (http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
	 */
	accessKeyId: string;
	/** Access Token of current session */
	sessionToken: string;
}
export interface apiOptions {
	headers: object;
	endpoints: object;
	credentials?: object;
}
export interface GraphQLOptions {
	query: string | DocumentNode;
	variables?: object;
	authMode?: GRAPHQL_AUTH_MODE;
}
export declare enum GRAPHQL_AUTH_MODE {
	API_KEY = 'API_KEY',
	AWS_IAM = 'AWS_IAM',
	OPENID_CONNECT = 'OPENID_CONNECT',
	AMAZON_COGNITO_USER_POOLS = 'AMAZON_COGNITO_USER_POOLS',
}
export interface GraphQLResult<T = object> {
	data?: T;
	errors?: [object];
	extensions?: {
		[key: string]: any;
	};
}
