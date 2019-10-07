import getUser from '@/services/getUser';
import { Auth } from '../__mocks__/Amplify.mocks';

describe('GetUser Service...', () => {
	it('...should exist', () => {
		expect(getUser).toBeTruthy();
	});

	it('...should call Auth.currentAuthenticatedUser', () => {
		getUser({ Auth });
		expect(Auth.currentAuthenticatedUser).toBeCalled();
	});

	it('...should return null if no user', async () => {
		const tempMock = {
			Auth: {
				currentAuthenticatedUser: jest.fn(() => Promise.resolve(null)),
			},
		};
		const res = await getUser(tempMock);
		expect(res).toEqual(null);
	});

	it('...should returnan error if currentAuthenticatedUser rejects', async () => {
		const tempMockFail = {
			Auth: {
				currentAuthenticatedUser: jest.fn(() =>
					Promise.reject(new Error('I rejected'))
				),
			},
		};
		const res = await getUser(tempMockFail);
		expect(res).toBeInstanceOf(Error);
	});
});
