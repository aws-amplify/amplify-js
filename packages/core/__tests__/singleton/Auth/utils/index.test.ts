import { decodeJWT } from '../../../../src/singleton/Auth/utils';

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
		}
	);
});
