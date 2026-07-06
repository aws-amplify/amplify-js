import { autoSignInUserConfirmed } from '../../../../../src/providers/cognito/utils/signUpHelpers';
import { authAPITestParams } from '../../testUtils/authApiTestParams';
import { signIn } from '../../../../../src/providers/cognito/apis/signIn';
import { signInWithUserAuth } from '../../../../../src/providers/cognito/apis/signInWithUserAuth';
import { SignInInput } from '../../../../../src/providers/cognito/types/inputs';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

const { user1 } = authAPITestParams;

jest.mock('../../../../../src/providers/cognito/apis/signIn');
jest.mock('../../../../../src/providers/cognito/apis/signInWithUserAuth');

const mockCtx = createMockAmplifyContext();

describe('autoSignInUserConfirmed()', () => {
	const mockSignIn = jest.mocked(signIn);
	const mockSignInWithUserAuth = jest.mocked(signInWithUserAuth);

	jest.useFakeTimers();

	afterEach(() => {
		jest.runAllTimers();
	});

	beforeEach(() => {
		mockSignIn.mockReset();
		mockSignInWithUserAuth.mockReset();
	});

	beforeAll(() => {
		setGlobalContext(mockCtx);
		mockSignIn.mockImplementation(jest.fn());
		mockSignInWithUserAuth.mockImplementation(jest.fn());
	});

	afterAll(() => {
		clearGlobalContext();
	});

	it('should call signInWithUserAuth with authFlowType USER_AUTH', () => {
		const signInInput: SignInInput = {
			username: user1.username,
			options: {
				authFlowType: 'USER_AUTH',
			},
		};

		autoSignInUserConfirmed(signInInput)();

		// USER_AUTH auto sign-in must call signInWithUserAuth directly (not signIn)
		// so the primed autoSignInStore session is preserved.
		expect(mockSignInWithUserAuth).toHaveBeenCalledTimes(1);
		expect(mockSignInWithUserAuth).toHaveBeenCalledWith(mockCtx, signInInput);
		expect(mockSignIn).not.toHaveBeenCalled();
	});

	it('should call signIn with default authFlowType', () => {
		const signInInput: SignInInput = {
			username: user1.username,
		};

		autoSignInUserConfirmed(signInInput)();

		expect(mockSignIn).toHaveBeenCalledTimes(1);
		expect(mockSignIn).toHaveBeenCalledWith(signInInput);
	});
});
