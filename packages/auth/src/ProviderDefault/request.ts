import { fetch } from 'cross-fetch';

export type Fetcher = (endpoint: string, options: RequestInit) => any;

// TODO: revisit once we determine whether `clientId` should be a non-optional
export interface RequestProps {
	/**
	 * AWS region
	 */
	region?: string;
	/**
	 * endpoint
	 */
	endpoint?: string;
	/**
	 * options for fetch API (only credentials is supported)
	 */
	fetchOptions?: {
		fetcher?: typeof fetch;
		credentials?: RequestCredentials;
	};
}

export function Request(props: RequestProps) {
	if (!props.region && !props.endpoint) {
		// TODO: enter correct error details & determine if error structure remains the same
		throw new Error(
			'Must define either a `region` or `endpoint` in `RequestProps`'
		);
	}
	const endpoint =
		props.endpoint || `https://cognito-idp.${props.region}.amazonaws.com/`;
	const fetchOptions = props.fetchOptions
		? { credentials: props.fetchOptions.credentials }
		: {};
	const fetcher: typeof fetch =
		(props.fetchOptions && props.fetchOptions.fetcher) || fetch;

	return async <Response>(
		operation: string,
		params: Record<string, any>
	): Promise<Response> => {
		return (
			await fetcher(endpoint, {
				...fetchOptions,
				body: JSON.stringify(params),
				headers: {
					'Content-Type': 'application/x-amz-json-1.1',
					'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
					'X-Amz-User-Agent': 'aws-amplify/0.1.x js',
				},
				method: 'POST',
			})
		).json();
	};
}

export type Request = typeof Request;
