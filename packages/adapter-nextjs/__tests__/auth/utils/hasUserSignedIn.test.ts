/**
 * @jest-environment node
 */
import { getCurrentUser } from 'aws-amplify/auth/server';
import { NextRequest } from 'next/server';
import { AuthUser } from '@aws-amplify/auth/cognito';
import { NextApiRequest } from 'next';

import {
	hasUserSignedInWithAppRouter,
	hasUserSignedInWithPagesRouter,
} from '../../../src/auth/utils/hasUserSignedIn';
import { NextServer } from '../../../src/types';
import { createMockNextApiResponse } from '../testUtils';

jest.mock('aws-amplify/auth/server');

const mockRunWithAmplifyServerContext =
	jest.fn() as jest.MockedFunction<NextServer.RunOperationWithContext>;
const mockGetCurrentUser = jest.mocked(getCurrentUser);

describe('hasUserSignedIn', () => {
	const mockContextSpec = { token: { value: Symbol('mock') } };
	const mockCurrentUserResult: AuthUser = {
		userId: 'mockUserId',
		username: 'mockUsername',
	};

	beforeAll(() => {
		mockRunWithAmplifyServerContext.mockImplementation(
			async ({ nextServerContext: _, operation }) => {
				return operation(mockContextSpec);
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

		it('invokes server getCurrentUser() with expected parameter within the injected runWithAmplifyServerContext function', async () => {
			await hasUserSignedInWithAppRouter({
				request: mockRequest,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(mockRunWithAmplifyServerContext).toHaveBeenCalledWith({
				nextServerContext: {
					request: mockRequest,
					response: expect.any(Response),
				},
				operation: expect.any(Function),
			});
			expect(mockGetCurrentUser).toHaveBeenCalledWith(mockContextSpec);
		});

		it('returns true when getCurrentUser() resolves (returned auth tokens)', async () => {
			const result = await hasUserSignedInWithAppRouter({
				request: mockRequest,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(result).toBe(true);
		});

		it('returns false when getCurrentUser() rejects (no auth tokens)', async () => {
			mockGetCurrentUser.mockRejectedValueOnce(new Error('No current user'));

			const result = await hasUserSignedInWithAppRouter({
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

		it('invokes server getCurrentUser() with expected parameter within the injected runWithAmplifyServerContext function', async () => {
			await hasUserSignedInWithPagesRouter({
				request: mockRequest,
				response: mockResponse,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(mockRunWithAmplifyServerContext).toHaveBeenCalledWith({
				nextServerContext: {
					request: mockRequest,
					response: mockResponse,
				},
				operation: expect.any(Function),
			});
			expect(mockGetCurrentUser).toHaveBeenCalledWith(mockContextSpec);
		});

		it('returns true when getCurrentUser() resolves (returned auth tokens)', async () => {
			const result = await hasUserSignedInWithPagesRouter({
				request: mockRequest,
				response: mockResponse,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(result).toBe(true);
		});

		it('returns false when getCurrentUser() rejects (no auth tokens)', async () => {
			mockGetCurrentUser.mockRejectedValueOnce(new Error('No current user'));

			const result = await hasUserSignedInWithPagesRouter({
				request: mockRequest,
				response: mockResponse,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(result).toBe(false);
		});
	});
});
