import { autoSignInUserConfirmed } from '../../../../../src/providers/cognito/utils/signUpHelpers';
import { authAPITestParams } from '../../testUtils/authApiTestParams';
import { signIn } from '../../../../../src/providers/cognito/apis/signIn';
import { SignInInput } from '../../../../../src/providers/cognito/types/inputs';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

const { user1 } = authAPITestParams;

jest.mock('../../../../../src/providers/cognito/apis/signIn');

describe('autoSignInUserConfirmed()', () => {
	const mockSignIn = jest.mocked(signIn);

	jest.useFakeTimers();

	afterEach(() => {
		jest.runAllTimers();
	});

	beforeEach(() => {
		mockSignIn.mockReset();
	});

	beforeAll(() => {
		mockSignIn.mockImplementation(jest.fn());
	});

	it('should call signIn with authFlowType USER_AUTH', () => {
		const signInInput: SignInInput = {
			username: user1.username,
			options: {
				authFlowType: 'USER_AUTH',
			},
		};

		autoSignInUserConfirmed(signInInput)();

		expect(mockSignIn).toHaveBeenCalledTimes(1);
		expect(mockSignIn).toHaveBeenCalledWith(signInInput);
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
