import { Amplify } from '../Amplify';
import { sign } from '../Signer';

export async function httpClient({
	endpoint,
	authMode = 'None',
	method,
	body,
	headers,
	service,
	region,
}: {
	endpoint: string;
	authMode: 'SigV4' | 'JWT' | 'None';
	method: 'GET' | 'POST' | 'PUT';
	body: any;
	headers: Record<string, string>;
	service: 'string';
	region: 'string';
}) {
	let libHeaders = {
		'Content-Type': 'application/x-amz-json-1.1',
		'Cache-Control': 'no-store',
	};
	if (authMode === 'SigV4') {
		const creds = Amplify.getUser();
		// add headers
		const signed_params = _signed({
			region,
			params: {
				method,
				data: JSON.stringify(body),
				url: endpoint,
				headers,
			},
			credentials: {
				...creds.awsCreds,
			},
			service,
		});
		libHeaders = { ...signed_params.headers };
	}

	if (authMode === 'JWT') {
		const user = Amplify.getUser();
		libHeaders['Authorization'] = user.idToken;
	}

	return callFetchWithRetry({
		endpoint,
		options: {
			headers: { ...libHeaders, ...headers },
			method,
			mode: 'cors',
			body: body ? JSON.stringify(body) : null,
		},
	});
}

async function callFetchWithRetry({ endpoint, options }) {
	return await (await fetch(endpoint, options)).json();
}

function _signed({ params, credentials, service, region }) {
	const { signerServiceInfo: signerServiceInfoParams, ...otherParams } = params;

	const endpoint_region: string = region;
	const endpoint_service: string = service;

	const creds = {
		secret_key: credentials.secretKey,
		access_key: credentials.accessKey,
		session_token: credentials.sessionToken,
	};

	const endpointInfo = {
		region: endpoint_region,
		service: endpoint_service,
	};

	let signerServiceInfo =
		region && service
			? Object.assign(endpointInfo, signerServiceInfoParams)
			: null;

	const signed_params = sign(otherParams, creds, signerServiceInfo);

	return signed_params;
}
