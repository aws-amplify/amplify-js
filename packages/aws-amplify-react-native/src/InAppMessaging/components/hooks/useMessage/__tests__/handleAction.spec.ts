/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { Linking } from 'react-native';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { InAppMessageAction } from '@aws-amplify/notifications';

import handleAction from '../handleAction';

jest.mock('react-native', () => ({
	Linking: {
		canOpenURL: jest.fn(),
		openURL: jest.fn(),
	},
}));

const logger = new Logger('TEST_LOGGER');

const deepLink = 'DEEP_LINK';
const link = 'LINK';
const url = 'https://docs.amplify.aws/';

const error = 'ERROR';

describe('handleAction', () => {
	beforeEach(() => {
		(Linking.canOpenURL as jest.Mock).mockClear();
		(Linking.openURL as jest.Mock).mockClear();

		(logger.error as jest.Mock).mockClear();
		(logger.info as jest.Mock).mockClear();
		(logger.warn as jest.Mock).mockClear();
	});

	it.each([deepLink, link])('handles a %s action as expected in the happy path', async (action) => {
		(Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true);

		await handleAction(action as InAppMessageAction, url);

		expect(logger.info).toHaveBeenCalledWith(`Handle action: ${action}`);
		expect(Linking.canOpenURL).toHaveBeenCalledWith(url);
		expect(logger.info).toHaveBeenCalledWith(`Opening url: ${url}`);
		expect(Linking.openURL).toHaveBeenCalledWith(url);
		expect(logger.info).toHaveBeenCalledTimes(2);
	});

	it.each([deepLink, link])(
		'logs a warning and early returns when a %s action is provided with a null url value',
		async (action) => {
			const invalidUrl = null;

			await handleAction(action as InAppMessageAction, invalidUrl);

			expect(logger.info).toHaveBeenCalledWith(`Handle action: ${action}`);
			expect(logger.warn).toHaveBeenCalledWith(`url values must be of type string: ${invalidUrl}`);
			expect(logger.info).toHaveBeenCalledTimes(1);
			expect(logger.warn).toHaveBeenCalledTimes(1);
			expect(Linking.canOpenURL).not.toHaveBeenCalled();
		}
	);

	it.each([deepLink, link])(
		'logs a warning and early returns when a %s action is provided with an undefined url value',
		async (action) => {
			const invalidUrl = undefined;

			await handleAction(action as InAppMessageAction, invalidUrl);

			expect(logger.info).toHaveBeenCalledWith(`Handle action: ${action}`);
			expect(logger.warn).toHaveBeenCalledWith(`url values must be of type string: ${invalidUrl}`);
			expect(logger.info).toHaveBeenCalledTimes(1);
			expect(logger.warn).toHaveBeenCalledTimes(1);
			expect(Linking.canOpenURL).not.toHaveBeenCalled();
		}
	);

	it('logs a warning when Linking.canOpenUrl returns false', async () => {
		(Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false);

		await handleAction(link, url);

		expect(logger.info).toHaveBeenCalledWith(`Handle action: ${link}`);
		expect(Linking.canOpenURL).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalledWith(`Unsupported url provided: ${url}`);
		expect(Linking.openURL).not.toHaveBeenCalled();
	});

	it('logs an error when Linking.canOpenUrl fails', async () => {
		(Linking.canOpenURL as jest.Mock).mockRejectedValueOnce(error);

		await handleAction(link, url);

		expect(logger.info).toHaveBeenCalledWith(`Handle action: ${link}`);
		expect(logger.error).toHaveBeenCalledWith(`Call to Linking.canOpenURL failed: ${error}`);
	});

	it('logs an error when Linking.openUrl fails', async () => {
		(Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true);
		(Linking.openURL as jest.Mock).mockRejectedValue(error);

		await handleAction(link, url);

		expect(logger.info).toHaveBeenCalledWith(`Handle action: ${link}`);
		expect(logger.error).toHaveBeenCalledWith(`Call to Linking.openURL failed: ${error}`);
	});
});
