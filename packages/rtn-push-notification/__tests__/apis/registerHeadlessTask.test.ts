// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppRegistry } from 'react-native';
import { getConstants } from '../../src/apis/getConstants';
import { registerHeadlessTask } from '../../src/apis/registerHeadlessTask';
import { normalizeNativeMessage } from '../../src/utils';
import { nativeMessage } from '../testUtils/data';

jest.mock('react-native', () => ({
	AppRegistry: {
		registerHeadlessTask: jest.fn(),
	},
}));
jest.mock('../../src/apis/getConstants');
jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		getConstants: jest.fn(),
	},
}));
jest.mock('../../src/utils');

describe('registerHeadlessTask', () => {
	const nativeHeadlessTaskKey = 'native-headless-task-key';
	// assert mocks
	const mockGetConstants = getConstants as jest.Mock;
	const mockReactNativeRegisterHeadlessTask =
		AppRegistry.registerHeadlessTask as jest.Mock;
	const mockNormalizeNativeMessage = normalizeNativeMessage as jest.Mock;

	beforeAll(() => {
		mockGetConstants.mockReturnValue({
			NativeHeadlessTaskKey: nativeHeadlessTaskKey,
		});
	});

	afterEach(() => {
		mockNormalizeNativeMessage.mockReset();
		mockReactNativeRegisterHeadlessTask.mockReset();
	});

	it('registers a task', () => {
		registerHeadlessTask(jest.fn());

		expect(mockReactNativeRegisterHeadlessTask).toBeCalledWith(
			nativeHeadlessTaskKey,
			expect.any(Function)
		);
	});

	it('calls the registered task with a normalized message', done => {
		mockNormalizeNativeMessage.mockImplementation(message => ({
			...message,
			body: `normalized-${message.body}`,
		}));
		mockReactNativeRegisterHeadlessTask.mockImplementation(async (_, task) => {
			await task()(nativeMessage);
			done();
		});
		const listener = jest.fn();
		registerHeadlessTask(listener);

		expect(listener).toBeCalledWith(
			expect.objectContaining({
				body: `normalized-${nativeMessage.body}`,
			})
		);
	});

	it('registers a task only if task key is available from the module', () => {
		mockGetConstants.mockReturnValue({});
		registerHeadlessTask(jest.fn());

		expect(mockReactNativeRegisterHeadlessTask).not.toBeCalled();
	});
});
