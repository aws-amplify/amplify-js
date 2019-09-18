import getUser from '../src/services/getUser';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';

describe('GetUser Service...', () => {
	it('...should exist', () => {
		expect(getUser).toBeTruthy();
	});

	it('...should call Auth.currentAuthenticatedUser', () => {
		getUser(AmplifyMocks);
		expect(AmplifyMocks.Auth.currentAuthenticatedUser).toBeCalled();
	});

	it('...should return null if no user', async () => {
		const tempMock = Object.assign(AmplifyMocks, {
			Auth: {
				currentAuthenticatedUser: jest.fn(() => Promise.resolve(null)),
			},
		});
		const res = await getUser(tempMock);
		expect(res).toEqual(null);
	});

	it('...should returnan error if currentAuthenticatedUser rejects', async () => {
		const tempMockFail = Object.assign(AmplifyMocks, {
			Auth: {
				currentAuthenticatedUser: jest.fn(() =>
					Promise.reject(new Error('I rejected'))
				),
			},
		});
		const res = await getUser(tempMockFail);
		expect(res).toBeInstanceOf(Error);
	});
});
