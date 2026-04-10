import { AuthUser, getCurrentUser } from 'aws-amplify/auth';
import { NextRequest } from 'next/server';
import { NextApiRequest } from 'next';

import {
	hasActiveUserSessionWithAppRouter,
	hasActiveUserSessionWithPagesRouter,
} from '../../../src/auth/utils/hasActiveUserSession';
import { NextServer } from '../../../src/types';
import { createMockNextApiResponse } from '../testUtils';

jest.mock('aws-amplify/auth');

const mockRunWithAmplifyServerContext =
	jest.fn() as jest.MockedFunction<NextServer.RunOperationWithContext>;
const mockGetCurrentUser = jest.mocked(getCurrentUser);

describe('hasUserSignedIn', () => {
	const mockCurrentUserResult: AuthUser = {
		userId: 'mockUserId',
		username: 'mockUsername',
	};

	beforeAll(() => {
		mockRunWithAmplifyServerContext.mockImplementation(
			async ({ operation }) => {
				return operation({} as any);
			},
		);
		mockGetCurrentUser.mockResolvedValue(mockCurrentUserResult);
	});

	afterEach(() => {
		mockRunWithAmplifyServerContext.mockClear();
		mockGetCurrentUser.mockClear();
	});

	describe('hasUserSignedInWithAppRouter', () => {
		const mockRequest = new NextRequest('https://example.com/api/auth/sign-in');

		it('invokes server getCurrentUser() within runWithAmplifyServerContext', async () => {
			await hasActiveUserSessionWithAppRouter({
				request: mockRequest,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(mockRunWithAmplifyServerContext).toHaveBeenCalledWith({
				serverContext: {
					request: mockRequest,
					response: expect.any(Response),
				},
				operation: expect.any(Function),
			});
			expect(mockGetCurrentUser).toHaveBeenCalled();
		});

		it('returns true when getCurrentUser() resolves', async () => {
			const result = await hasActiveUserSessionWithAppRouter({
				request: mockRequest,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(result).toBe(true);
		});

		it('returns false when getCurrentUser() rejects', async () => {
			mockGetCurrentUser.mockRejectedValueOnce(new Error('No current user'));

			const result = await hasActiveUserSessionWithAppRouter({
				request: mockRequest,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(result).toBe(false);
		});
	});

	describe('hasUserSignedInWithPagesRouter', () => {
		const mockRequest = {
			url: 'https://example.com/api/auth/sign-in',
		} as unknown as NextApiRequest;
		const { mockResponse } = createMockNextApiResponse();

		it('invokes server getCurrentUser() within runWithAmplifyServerContext', async () => {
			await hasActiveUserSessionWithPagesRouter({
				request: mockRequest,
				response: mockResponse,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(mockRunWithAmplifyServerContext).toHaveBeenCalledWith({
				serverContext: {
					request: mockRequest,
					response: mockResponse,
				},
				operation: expect.any(Function),
			});
			expect(mockGetCurrentUser).toHaveBeenCalled();
		});

		it('returns true when getCurrentUser() resolves', async () => {
			const result = await hasActiveUserSessionWithPagesRouter({
				request: mockRequest,
				response: mockResponse,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(result).toBe(true);
		});

		it('returns false when getCurrentUser() rejects', async () => {
			mockGetCurrentUser.mockRejectedValueOnce(new Error('No current user'));

			const result = await hasActiveUserSessionWithPagesRouter({
				request: mockRequest,
				response: mockResponse,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(result).toBe(false);
		});
	});
});
