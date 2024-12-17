import { autoSignInUserConfirmed } from '../../../../../src/providers/cognito/utils/signUpHelpers';
import { authAPITestParams } from '../../testUtils/authApiTestParams';
import { signInWithUserAuth } from '../../../../../src/providers/cognito/apis/signInWithUserAuth';
import { signIn } from '../../../../../src/providers/cognito/apis/signIn';
import { SignInInput } from '../../../../../src/providers/cognito/types/inputs';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

const { user1 } = authAPITestParams;

jest.mock('../../../../../src/providers/cognito/apis/signInWithUserAuth');
jest.mock('../../../../../src/providers/cognito/apis/signIn');

describe('autoSignInUserConfirmed()', () => {
	const mockSignInWithUserAuth = jest.mocked(signInWithUserAuth);
	const mockSignIn = jest.mocked(signIn);

	jest.useFakeTimers();

	afterEach(() => {
		jest.runAllTimers();
	});

	beforeEach(() => {
		mockSignInWithUserAuth.mockReset();
		mockSignIn.mockReset();
	});

	beforeAll(() => {
		mockSignInWithUserAuth.mockImplementation(jest.fn());
		mockSignIn.mockImplementation(jest.fn());
	});

	it('should call the correct API with authFlowType USER_AUTH', () => {
		const signInInput: SignInInput = {
			username: user1.username,
			options: {
				authFlowType: 'USER_AUTH',
			},
		};

		autoSignInUserConfirmed(signInInput)();

		expect(mockSignInWithUserAuth).toHaveBeenCalledTimes(1);
		expect(mockSignInWithUserAuth).toHaveBeenCalledWith(signInInput);

		expect(mockSignIn).not.toHaveBeenCalled();
	});

	it('should call the correct API with default authFlowType', () => {
		const signInInput: SignInInput = {
			username: user1.username,
		};

		autoSignInUserConfirmed(signInInput)();

		expect(mockSignInWithUserAuth).not.toHaveBeenCalled();

		expect(mockSignIn).toHaveBeenCalledTimes(1);
		expect(mockSignIn).toHaveBeenCalledWith(signInInput);
	});
});
