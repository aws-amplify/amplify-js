import { decodeJWT } from 'aws-amplify/adapter-core/internals';

import { getAccessTokenUsername } from '../../../src/auth/utils/getAccessTokenUsername';

jest.mock('aws-amplify/adapter-core/internals');

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

		expect(getAccessTokenUsername('accessToken')).toStrictEqual('a_user');
	});
});
