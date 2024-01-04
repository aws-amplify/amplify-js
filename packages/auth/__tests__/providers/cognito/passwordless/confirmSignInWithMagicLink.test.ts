// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	assertTokenProviderConfig,
	base64Decoder,
} from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';

import { initiateAuth } from '../../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import {
	isMagicLinkFragment,
	loadMagicLinkSignInState,
} from '../../../../src/providers/cognito/apis/passwordless/confirmSignInWithMagicLink';
import {
	assertUserNotAuthenticated,
	setActiveSignInUsername,
} from '../../../../src/providers/cognito/utils/signInHelpers';
import { setActiveSignInState } from '../../../../src/providers/cognito/utils/signInStore';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})), libraryOptions: {} },
}));
jest.mock('../../../../src/providers/cognito/utils/signInHelpers');
jest.mock(
	'../../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);
jest.mock('../../../../src/providers/cognito/utils/signInStore');

const mockAssertTokenProviderConfig = assertTokenProviderConfig as jest.Mock;
const mockBase64DecoderConvert = base64Decoder.convert as jest.Mock;
const mockAmplifyGetConfig = Amplify.getConfig as jest.Mock;
const mockAssertUserNotAuthenticated = assertUserNotAuthenticated as jest.Mock;
const mockSetActiveSignInUsername = setActiveSignInUsername as jest.Mock;
const mockSetActiveSignInState = setActiveSignInState as jest.Mock;
const mockInitiateAuth = initiateAuth as jest.Mock;

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

describe('isMagicLinkFragment', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return false if Magic Link code is not separated by period', () => {
		const code = 'code';
		expect(isMagicLinkFragment(code)).toBe(false);
	});

	it('should return false if Magic Link code has extra period', () => {
		const code = 'code.code.code';
		expect(isMagicLinkFragment(code)).toBe(false);
	});

	it('should return false if Magic Link code 1st fragment is not base64 encoded JSON', () => {
		const code = 'code1.code2';
		mockBase64DecoderConvert.mockReturnValueOnce(null);
		expect(isMagicLinkFragment(code)).toBe(false);
		expect(mockBase64DecoderConvert).toHaveBeenCalledWith('code1');
	});

	it('should return false if Magic Link code 1st fragment is not valid JSON', () => {
		const code = 'code1.code2';
		mockBase64DecoderConvert.mockReturnValueOnce('not json');
		expect(isMagicLinkFragment(code)).toBe(false);
		expect(mockBase64DecoderConvert).toHaveBeenCalledWith('code1');
	});

	it('should return false if Magic Link code 1st fragment JSON does not have username', () => {
		const code = 'code1.code2';
		mockBase64DecoderConvert.mockReturnValueOnce(
			JSON.stringify({ iat: 1, exp: 2 })
		);
		expect(isMagicLinkFragment(code)).toBe(false);
		expect(mockBase64DecoderConvert).toHaveBeenCalledWith('code1');
	});

	it('should return false if Magic Link code 1st fragment JSON does not have iat', () => {
		const code = 'code1.code2';
		mockBase64DecoderConvert.mockReturnValueOnce(
			JSON.stringify({ username: 'username', exp: 2 })
		);
		expect(isMagicLinkFragment(code)).toBe(false);
		expect(mockBase64DecoderConvert).toHaveBeenCalledWith('code1');
	});

	it('should return false if Magic Link code 1st fragment JSON does not have exp', () => {
		const code = 'code1.code2';
		mockBase64DecoderConvert.mockReturnValueOnce(
			JSON.stringify({ username: 'username', iat: 1 })
		);
		expect(isMagicLinkFragment(code)).toBe(false);
		expect(mockBase64DecoderConvert).toHaveBeenCalledWith('code1');
	});

	it('should return true if Magic Link code is valid', () => {
		const code = 'code1.code2';
		mockBase64DecoderConvert.mockReturnValueOnce(
			JSON.stringify({ username: 'username', iat: 1, exp: 2 })
		);
		expect(isMagicLinkFragment(code)).toBe(true);
		expect(mockBase64DecoderConvert).toHaveBeenCalledWith('code1');
	});
});

describe('loadMagicLinkSignInState', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAmplifyGetConfig.mockReturnValue({ Auth: authConfig });
		mockInitiateAuth.mockResolvedValue({
			Session: 'session1',
		});
		mockBase64DecoderConvert.mockReturnValue(
			JSON.stringify({
				username: 'username',
				iat: 1,
				exp: 2,
			})
		);
	});

	it('should verify if token provider configured', async () => {
		expect.assertions(1);
		await loadMagicLinkSignInState('code');
		expect(mockAssertTokenProviderConfig).toHaveBeenCalledWith(
			authConfig.Cognito
		);
	});

	it('should throw if user is already authenticated', async () => {
		expect.assertions(1);
		await loadMagicLinkSignInState('code');
		expect(mockAssertUserNotAuthenticated).toHaveBeenCalled();
	});

	it('should call initiateAuth with correct parameters', async () => {
		expect.assertions(1);
		const code = 'code';
		await loadMagicLinkSignInState(code);
		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			{
				AuthFlow: 'CUSTOM_AUTH',
				ClientId: authConfig.Cognito.userPoolClientId,
				AuthParameters: {
					USERNAME: 'username',
				},
			}
		);
	});

	it('should set the signIn state correctly', async () => {
		expect.assertions(2);
		const code = 'code';
		await loadMagicLinkSignInState(code);
		expect(mockSetActiveSignInUsername).toHaveBeenCalledWith('username');
		expect(mockSetActiveSignInState).toHaveBeenCalledWith({
			username: 'username',
			challengeName: 'CUSTOM_CHALLENGE',
			signInSession: 'session1',
			signInDetails: {
				loginId: 'username',
				authFlowType: 'CUSTOM_WITHOUT_SRP',
				passwordlessMethod: 'MAGIC_LINK',
			},
		});
	});
});
