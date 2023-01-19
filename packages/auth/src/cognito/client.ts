const USER_AGENT = 'amplify test';
export async function requestCognitoUserPool({ operation, params, region }) {
	const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

	const headers = {
		'Content-Type': 'application/x-amz-json-1.1',
		'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
		'X-Amz-User-Agent': USER_AGENT,
		'Cache-Control': 'no-store',
	};

	const options: RequestInit = {
		headers,
		method: 'POST',
		mode: 'cors',
		body: JSON.stringify(params),
	};

	return await (await fetch(endpoint, options)).json();
}

export async function requestCognitoIdentityPool({
	operation,
	params,
	region,
}) {
	const endpoint = `https://cognito-identity.${region}.amazonaws.com/`;

	const headers = {
		'Content-Type': 'application/x-amz-json-1.1',
		'X-Amz-Target': `com.amazonaws.cognito.identity.model.AWSCognitoIdentityService.${operation}`,
		'X-Amz-User-Agent': USER_AGENT,
		'Cache-Control': 'no-store',
	};

	const options: RequestInit = {
		headers,
		method: 'POST',
		mode: 'cors',
		body: JSON.stringify(params),
	};

	return await (await fetch(endpoint, options)).json();
}
