import { decodeJWT } from '@aws-amplify/core';

import { getAccessTokenUsernameAndClockDrift } from '../../../src/auth/utils/getAccessTokenUsernameAndClockDrift';

jest.mock('@aws-amplify/core');

const mockDecodeJWT = jest.mocked(decodeJWT);

describe('getAccessTokenUsernameAndClockDrift', () => {
	let dateNowSpy: jest.SpyInstance;

	beforeAll(() => {
		dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
	});

	afterAll(() => {
		dateNowSpy.mockRestore();
	});

	it('should return username and clock drift', () => {
		mockDecodeJWT.mockReturnValueOnce({
			payload: {
				username: 'a_user',
				iat: 1,
			},
		});

		expect(getAccessTokenUsernameAndClockDrift('accessToken')).toEqual(
			expect.objectContaining({
				username: 'a_user',
				clockDrift: 1000,
			}),
		);
	});

	it('should return default username and clock drift when username is not present in the payload', () => {
		mockDecodeJWT.mockReturnValueOnce({
			payload: {},
		});

		expect(getAccessTokenUsernameAndClockDrift('accessToken')).toEqual(
			expect.objectContaining({
				username: 'username',
				clockDrift: 0,
			}),
		);
	});
});
