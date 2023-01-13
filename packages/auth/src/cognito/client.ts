const USER_AGENT = 'amplify test';
export async function request({ operation, params, region }) {
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

	const resp = await (await fetch(endpoint, options)).json();
	return resp;
}
