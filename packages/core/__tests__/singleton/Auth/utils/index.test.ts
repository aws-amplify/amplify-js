import {
	assertIdentityPoolIdConfig,
	assertOAuthConfig,
	assertTokenProviderConfig,
	decodeJWT,
} from '../../../../src/singleton/Auth/utils';

const testSamples = [
	{
		token:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0ODUxNDA5ODQsImlhdCI6MTQ4NTEzNzM4NCwiZW1haWwiOiJlc3RzZUB0ZXN0LmNvbSIsIm1lc3NhZ2UiOiJoaWRkZW4qKioqKioqKnNlY3JldCIsInN1YiI6IjI5YWMwYzE4LTBiNGEtNDJjZi04MmZjLTAzZDU3MDMxOGExZCIsImFwcGxpY2F0aW9uSWQiOiI3OTEwMzczNC05N2FiLTRkMWEtYWYzNy1lMDA2ZDA1ZDI5NTIiLCJyb2xlcyI6W119.Mp0Pcwsz5VECK11Kf2ZZNF_SMKu5CgBeLN9ZOP04kZo',
		decoded: {
			exp: 1485140984,
			iat: 1485137384,
			email: 'estse@test.com',
			message: 'hidden********secret',
			sub: '29ac0c18-0b4a-42cf-82fc-03d570318a1d',
			applicationId: '79103734-97ab-4d1a-af37-e006d05d2952',
			roles: [],
		},
	},
	{
		token:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0ODUxNDA5ODQsImlhdCI6MTQ4NTEzNzM4NCwiZW1haWwiOiJlc3RzZUB0ZXN0LmNvbSIsIm1lc3NhZ2UiOiIhQCMkJV4mKigpaGVsbG8ifQ.Mp0Pcwsz5VECK11Kf2ZZNF_SMKu5CgBeLN9ZOP04kZo',
		decoded: {
			exp: 1485140984,
			iat: 1485137384,
			email: 'estse@test.com',
			message: '!@#$%^&*()hello',
		},
	},
];

describe('decodeJWT', () => {
	it.each(testSamples)(
		'decodes payload of a JWT token',
		({ token, decoded }) => {
			const result = decodeJWT(token);
			expect(result.payload).toEqual(decoded);
			expect(result.toString()).toEqual(token);
		},
	);

	it('throws error for invalid token format', () => {
		expect(() => decodeJWT('invalid')).toThrow('Invalid token');
	});

	it('throws error for malformed payload', () => {
		expect(() => decodeJWT('header.invalid-payload.signature')).toThrow(
			'Invalid token payload',
		);
	});
});

describe('assertTokenProviderConfig', () => {
	it('passes with valid user pool config', () => {
		expect(() => {
			assertTokenProviderConfig({
				userPoolId: 'us-east-1_test',
				userPoolClientId: 'client123',
			});
		}).not.toThrow();
	});

	it('throws when config is undefined', () => {
		expect(() => {
			assertTokenProviderConfig(undefined);
		}).toThrow();
	});

	it('throws when userPoolId is missing', () => {
		expect(() => {
			assertTokenProviderConfig({
				userPoolClientId: 'client123',
			} as any);
		}).toThrow();
	});

	it('throws when userPoolClientId is missing', () => {
		expect(() => {
			assertTokenProviderConfig({
				userPoolId: 'us-east-1_test',
			} as any);
		}).toThrow();
	});
});

describe('assertOAuthConfig', () => {
	it('passes with valid oauth config', () => {
		expect(() => {
			assertOAuthConfig({
				userPoolId: 'us-east-1_test',
				userPoolClientId: 'client123',
				loginWith: {
					oauth: {
						domain: 'example.auth.us-east-1.amazoncognito.com',
						redirectSignIn: ['http://localhost:3000/'],
						redirectSignOut: ['http://localhost:3000/'],
						responseType: 'code',
						scopes: ['openid'],
					},
				},
			});
		}).not.toThrow();
	});

	it('throws when oauth config is missing', () => {
		expect(() => {
			assertOAuthConfig(undefined);
		}).toThrow();
	});

	it('throws when domain is missing', () => {
		expect(() => {
			assertOAuthConfig({
				userPoolId: 'us-east-1_test',
				userPoolClientId: 'client123',
				loginWith: {
					oauth: {
						redirectSignIn: ['http://localhost:3000/'],
						redirectSignOut: ['http://localhost:3000/'],
						responseType: 'code',
					} as any,
				},
			});
		}).toThrow();
	});
});

describe('assertIdentityPoolIdConfig', () => {
	it('passes with valid identity pool config', () => {
		expect(() => {
			assertIdentityPoolIdConfig({
				identityPoolId: 'us-east-1:test-id',
			});
		}).not.toThrow();
	});

	it('throws when identityPoolId is missing', () => {
		expect(() => {
			assertIdentityPoolIdConfig(undefined);
		}).toThrow();
	});

	it('throws when identityPoolId is empty', () => {
		expect(() => {
			assertIdentityPoolIdConfig({} as any);
		}).toThrow();
	});
});
