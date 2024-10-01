import { AuthError } from '../../../src/errors/AuthError';
import {
	getRegionFromIdentityPoolId,
	getRegionFromUserPoolId,
} from '../../../src/foundation/parsers/regionParsers';

describe('getRegionFromIdentityPoolId()', () => {
	it('returns the region from the identity pool id', () => {
		const identityPoolId = 'us-west-2:12345678-1234-1234-1234-123456789012';
		const region = getRegionFromIdentityPoolId(identityPoolId);
		expect(region).toEqual('us-west-2');
	});

	test.each([undefined, 'invalid-id-123'])(
		`throws an error when the identity pool id is invalid as %p`,
		identityPoolId => {
			expect(() => getRegionFromIdentityPoolId(identityPoolId)).toThrow(
				new AuthError({
					name: 'InvalidIdentityPoolIdException',
					message: 'Invalid identity pool id provided.',
					recoverySuggestion:
						'Make sure a valid identityPoolId is given in the config.',
				}),
			);
		},
	);
});

describe('getRegionFromUserPoolId()', () => {
	it('should return the region from the user pool id', () => {
		const userPoolId = 'us-west-2_12345678';
		const region = getRegionFromUserPoolId(userPoolId);
		expect(region).toEqual('us-west-2');
	});

	test.each([undefined, 'invalid-id-123'])(
		`throws an error when the user pool id is invalid as %p`,
		userPoolId => {
			expect(() => getRegionFromUserPoolId(userPoolId)).toThrow(
				new AuthError({
					name: 'InvalidUserPoolId',
					message: 'Invalid user pool id provided.',
				}),
			);
		},
	);
});
