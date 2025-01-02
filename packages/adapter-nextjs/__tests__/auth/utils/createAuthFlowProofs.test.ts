import { urlSafeEncode } from '@aws-amplify/core/internals/utils';
import { generateCodeVerifier, generateState } from 'aws-amplify/adapter-core';

import { createAuthFlowProofs } from '../../../src/auth/utils';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock('aws-amplify/adapter-core');

const mockUrlSafeEncode = jest.mocked(urlSafeEncode);
const mockGenerateCodeVerifier = jest.mocked(generateCodeVerifier);
const mockGenerateState = jest.mocked(generateState);

describe('createAuthFlowProofs', () => {
	beforeAll(() => {
		mockUrlSafeEncode.mockImplementation(value => `encoded-${value}`);
	});

	afterEach(() => {
		mockUrlSafeEncode.mockClear();
		mockGenerateCodeVerifier.mockClear();
		mockGenerateState.mockClear();
	});

	it('invokes generateCodeVerifier and generateState then returns codeVerifier and state', () => {
		mockGenerateCodeVerifier.mockReturnValueOnce({
			value: 'value',
			method: 'S256',
			toCodeChallenge: jest.fn(),
		});
		mockGenerateState.mockReturnValueOnce('state');

		const result = createAuthFlowProofs({});

		expect(result).toEqual(
			expect.objectContaining({
				codeVerifier: {
					value: 'value',
					method: 'S256',
					toCodeChallenge: expect.any(Function),
				},
				state: 'state',
			}),
		);
		expect(mockUrlSafeEncode).not.toHaveBeenCalled();
	});

	it('invokes generateCodeVerifier and generateState then returns codeVerifier and state with customState', () => {
		mockGenerateCodeVerifier.mockReturnValueOnce({
			value: 'value',
			method: 'S256',
			toCodeChallenge: jest.fn(),
		});
		mockGenerateState.mockReturnValueOnce('state');

		const result = createAuthFlowProofs({ customState: 'customState' });

		expect(result).toEqual(
			expect.objectContaining({
				codeVerifier: {
					value: 'value',
					method: 'S256',
					toCodeChallenge: expect.any(Function),
				},
				state: 'state-encoded-customState',
			}),
		);
		expect(mockUrlSafeEncode).toHaveBeenCalledWith('customState');
	});
});
