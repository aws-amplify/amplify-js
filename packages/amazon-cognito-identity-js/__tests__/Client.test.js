import Client from '../src/Client'
import CognitoError from '../src/Client'
import UserAgent from '../src/UserAgent'

afterEach(() => {
	jest.restoreAllMocks();
});



describe('Constructors for Client', () => {
	test('CognitoError class', () => {
		const cognitoError = new CognitoError('Error Message', 'Error Name', 'Error Status Code')
		expect(cognitoError.endpoint).toBe('Error Name')
		expect(cognitoError.fetchOptions).toEqual({})
	})

	test('Cognito Identity Provider Client', () => {
		const client = new Client('us-east-2', null, {})
		expect(client.endpoint).toBe('https://cognito-idp.us-east-2.amazonaws.com/')
		expect(client.fetchOptions).toEqual({})
	})
})


// /**
//  * 
//  * Case 1 - Happy case: 
//  */
// describe('Testing Requests', () => {

// 	const clientInstance = new Client('us-east-2', null, {})
// 	const headers = {
// 		'Content-Type': 'application/x-amz-json-1.1',
// 		'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
// 		'X-Amz-User-Agent': UserAgent.prototype.userAgent,
// 	};

// 	const options = Object.assign({}, clientInstance.fetchOptions, {
// 		headers,
// 		method: 'POST',
// 		mode: 'cors',
// 		cache: 'no-cache',
// 		body: JSON.stringify(params),
// 	});
// 	test('Happy case', async () => {
// 		await clientInstance.promisifyRequest()

// 	})
// })