/**
 * @jest-environment node
 */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import cloneDeep from 'lodash/cloneDeep';

import {
	extractContent,
	mapOSPlatform,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils/helpers';

import {
	nonBrowserConfigTestCases,
	nativePinpointInAppMessagesWithOverrides,
} from '../../../../testUtils/data';

jest.mock('@aws-amplify/core');

jest.mock('@aws-amplify/core/internals/utils', () => {
	const originalModule = jest.requireActual(
		'@aws-amplify/core/internals/utils'
	);
	return {
		...originalModule,
		getClientInfo: jest.fn(), // Setup as a Jest mock function without implementation
	};
});

describe('InAppMessaging Provider Utils', () => {
	describe('extractContent with overrides', () => {
		describe('when running natively', () => {
			nativePinpointInAppMessagesWithOverrides.forEach(
				({ message, expectedContent, configPlatform }) => {
					test(`correctly extracts content for ${configPlatform}`, () => {
						const utils = require('@aws-amplify/core/internals/utils');
						// Dynamically override the mock for getClientInfo
						utils.getClientInfo.mockImplementation(() => ({
							platform: configPlatform,
						}));

						const pinpointInAppMessage = cloneDeep(message);
						const content = extractContent(pinpointInAppMessage);
						expect(content[0].primaryButton).toStrictEqual(
							expectedContent[0].primaryButton
						);
						expect(content[0].secondaryButton).toStrictEqual(
							expectedContent[0].secondaryButton
						);
					});
				}
			);
		});
	});

	describe('mapOSPlatform method', () => {
		describe('when running natively', () => {
			nonBrowserConfigTestCases.forEach(({ os, expectedPlatform }) => {
				test(`correctly maps OS "${os}" to ConfigPlatformType "${expectedPlatform}"`, () => {
					const result = mapOSPlatform(os);
					expect(result).toBe(expectedPlatform);
				});
			});
		});
	});
});
